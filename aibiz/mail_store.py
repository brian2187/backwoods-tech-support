#!/usr/bin/env python3
"""Virtual Assistant local ledger. One alias only."""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
LEDGER = DATA / "ledger.jsonl"
ACTIONS = DATA / "actions.jsonl"
CONTROL = DATA / "control.json"
HEART = DATA / "heartbeat.json"
DROP = DATA / "drop"
OUTBOX = DATA / "outbox"

ACCOUNT = "mttech_sarfarm@outlook.com"


def _ny() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def ensure() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    DROP.mkdir(parents=True, exist_ok=True)
    OUTBOX.mkdir(parents=True, exist_ok=True)
    if not CONTROL.exists():
        CONTROL.write_text(
            json.dumps(
                {
                    "account": "MTTech_SARFarm@outlook.com",
                    "service": "Virtual Assistant",
                    "parent": "Mountain Top Tech / SAR Farms",
                    "may_send": False,
                    "port": 8780,
                    "host": "127.0.0.1",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
    for p in (LEDGER, ACTIONS):
        if not p.exists():
            p.write_text("", encoding="utf-8")


def control() -> dict:
    ensure()
    try:
        rec = json.loads(CONTROL.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        rec = {}
    return rec if isinstance(rec, dict) else {}


def set_control(**kwargs) -> dict:
    rec = control()
    rec.update(kwargs)
    rec["updated"] = _ny()
    CONTROL.write_text(json.dumps(rec, indent=2) + "\n", encoding="utf-8")
    return rec


def heartbeat(extra: dict | None = None) -> dict:
    ensure()
    rec = {
        "ts": _ny(),
        "unix": time.time(),
        "account": control().get("account"),
        "may_send": bool(control().get("may_send")),
    }
    if extra:
        rec.update(extra)
    HEART.write_text(json.dumps(rec, indent=2) + "\n", encoding="utf-8")
    return rec


def _append(path: Path, rec: dict) -> dict:
    ensure()
    rec = dict(rec)
    rec.setdefault("id", uuid.uuid4().hex[:12])
    rec.setdefault("ts", _ny())
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return rec


def log_action(kind: str, **kwargs) -> dict:
    return _append(ACTIONS, {"kind": kind, **kwargs})


def _addr_blob(rec: dict) -> str:
    parts = [
        rec.get("from") or "",
        rec.get("to") or "",
        rec.get("cc") or "",
        rec.get("account") or "",
    ]
    if isinstance(rec.get("to"), list):
        parts.append(" ".join(str(x) for x in rec["to"]))
    return " ".join(str(p) for p in parts).lower()


def ours(rec: dict) -> bool:
    return ACCOUNT in _addr_blob(rec)


def ingest(rec: dict, *, source: str = "drop") -> dict:
    if not ours(rec):
        raise ValueError("not Virtual Assistant mail")
    row = {
        "dir": rec.get("dir") or "in",
        "from": rec.get("from"),
        "to": rec.get("to"),
        "subject": rec.get("subject") or "",
        "body": rec.get("body") or rec.get("body_preview") or "",
        "outlook_id": rec.get("outlook_id") or rec.get("message_id") or "",
        "status": rec.get("status") or "logged",
        "source": source,
    }
    saved = _append(LEDGER, row)
    log_action("ingest", mail_id=saved["id"], source=source, subject=saved["subject"])
    return saved


def load_ledger(limit: int = 200) -> list[dict]:
    ensure()
    rows: list[dict] = []
    if not LEDGER.exists():
        return rows
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(rec, dict):
            rows.append(rec)
    return rows[-limit:][::-1]


def load_actions(limit: int = 80) -> list[dict]:
    ensure()
    rows: list[dict] = []
    if not ACTIONS.exists():
        return rows
    for line in ACTIONS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(rec, dict):
            rows.append(rec)
    return rows[-limit:][::-1]


def queue_out(to: str, subject: str, body: str) -> dict:
    rec = ingest(
        {
            "dir": "out",
            "from": "MTTech_SARFarm@outlook.com",
            "to": to,
            "subject": subject,
            "body": body,
            "status": "queued",
        },
        source="compose",
    )
    (OUTBOX / f"{rec['id']}.json").write_text(
        json.dumps(rec, indent=2) + "\n", encoding="utf-8"
    )
    log_action("queue", mail_id=rec["id"], to=to, subject=subject)
    return rec


def ingest_drop() -> list[dict]:
    ensure()
    saved: list[dict] = []
    for p in sorted(DROP.glob("*.json")):
        rec = json.loads(p.read_text(encoding="utf-8"))
        if not isinstance(rec, dict):
            continue
        saved.append(ingest(rec, source=f"drop:{p.name}"))
        p.rename(DROP / f"{p.stem}.done")
    return saved

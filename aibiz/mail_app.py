#!/usr/bin/env python3
"""Virtual Assistant mail desk. http://127.0.0.1:8780/"""

from __future__ import annotations

import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import mail_store as store

HOST = "127.0.0.1"
PORT = 8780
UI = Path(__file__).resolve().parent / "ui"
INTERVAL = 20


def _state() -> dict:
    ctl = store.control()
    heart = {}
    if store.HEART.exists():
        try:
            heart = json.loads(store.HEART.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            heart = {}
    ledger = store.load_ledger()
    inbound = [r for r in ledger if r.get("dir") != "out"]
    outbound = [r for r in ledger if r.get("dir") == "out"]
    queued = [r for r in outbound if r.get("status") == "queued"]
    return {
        "ok": True,
        "control": ctl,
        "heartbeat": heart,
        "counts": {
            "in": len(inbound),
            "out": len(outbound),
            "queued": len(queued),
            "actions": len(store.load_actions()),
        },
        "inbox": inbound[:80],
        "sent": [r for r in outbound if r.get("status") != "queued"][:80],
        "queued": queued[:80],
        "actions": store.load_actions()[:40],
    }


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("va-mail %s - %s\n" % (self.address_string(), fmt % args))

    def _json(self, code, obj):
        body = json.dumps(obj, default=str).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _html(self):
        data = (UI / "index.html").read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/index.html"):
            self._html()
            return
        if path == "/api/state":
            self._json(200, _state())
            return
        self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            body = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self._json(400, {"ok": False, "error": "bad json"})
            return
        if not isinstance(body, dict):
            self._json(400, {"ok": False, "error": "object required"})
            return
        try:
            if path == "/api/ingest":
                rec = store.ingest(body, source="api")
                self._json(200, {"ok": True, "mail": rec})
                return
            if path == "/api/compose":
                rec = store.queue_out(
                    str(body.get("to") or "").strip(),
                    str(body.get("subject") or "").strip(),
                    str(body.get("body") or "").strip(),
                )
                self._json(200, {"ok": True, "mail": rec, "queued": True})
                return
            if path == "/api/scan-drop":
                saved = store.ingest_drop()
                self._json(200, {"ok": True, "n": len(saved)})
                return
        except ValueError as exc:
            self._json(400, {"ok": False, "error": str(exc)})
            return
        self._json(404, {"ok": False, "error": "not found"})


def _loop():
    while True:
        try:
            n = len(store.ingest_drop())
            store.heartbeat({"drop_ingested": n, "ledger": len(store.load_ledger(5000))})
        except Exception as exc:
            store.heartbeat({"error": str(exc)[:200]})
        time.sleep(INTERVAL)


def main() -> None:
    store.ensure()
    store.heartbeat({"boot": True})
    threading.Thread(target=_loop, daemon=True).start()
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Virtual Assistant mail desk http://{HOST}:{PORT}/", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()

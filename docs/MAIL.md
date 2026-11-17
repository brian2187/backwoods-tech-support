# Virtual Assistant mail desk

Dedicated operator loop for **MTTech_SARFarm@outlook.com**.

Parent: Mountain Top Tech, a subdivision of Something Ain't Right Farms.

Code lives in this repo under [`../aibiz/`](../aibiz/). Optional on the Alien — you can send from Outlook yourself.

## Scope

This app owns **business mail actions** for that address only:

- Inbound to `MTTech_SARFarm@outlook.com`
- Outbound queued as Virtual Assistant (not Hotmail, not Work, not Chase)

It does **not** send until `aibiz/data/control.json` has `"may_send": true` **and** Brian (or this TUI with his explicit send order) fires a queued item.

## Ports

`http://127.0.0.1:8780/` — not 8767–8770 (those are the trading desk).

## Sync

The Grok Outlook connector is a TUI session, not a Python process. Ingest:

1. Drop JSON under `aibiz/data/drop/` (one message per file), or
2. `POST /api/ingest` with a message object.

Anything not addressed to/from the business alias is refused.

## Do not

- Mix Work / Chase / VDI mail
- Auto-send outreach
- Bind 8767–8770
- Start wake.py from this folder
- Change the public GitHub Pages site from this loop

`MTTech_SARFarm@outlook.com` is a **separate** Outlook.com mailbox. Hotmail `moorebmoore@hotmail.com` is Brian's personal inbox (dual-notify). Add the MTTech account in desktop Outlook so the contact-desk watcher can see enroll and Less Traveled mail.

Contact-desk watch is **on** (2026-11-15). `aibiz/watch_contact_mail.ps1` queues inbound desk mail. Grok may act on requests that do not change the public site. Review items notify `moorebmoore@hotmail.com`. Phone text is off: Verizon decommissioned Email to Text (vtext / vzwpix); the T-Mobile gateway was the wrong carrier and bounced. Notification subjects use `[VA-DESK]` so the watcher ignores them. Notify and replies to inbound desk mail are allowed; cold outreach is not.

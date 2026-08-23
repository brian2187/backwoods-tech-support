# Virtual Assistant mail desk

Local app for **MTTech_SARFarm@outlook.com**. Optional on the Alien — you can send from Outlook yourself.

```
python mail_app.py
```

Or double-click `Open-VA-mail.cmd`.

UI: http://127.0.0.1:8780/

Gates: [MAIL.md](../docs/MAIL.md). Send stays locked until `data/control.json` `may_send` is true **and** a queued item is explicitly fired.

Does not bind 8767–8770. Does not start wake.py. Ledger/outbox are gitignored.

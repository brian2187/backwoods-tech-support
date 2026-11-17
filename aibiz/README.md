# Virtual Assistant mail desk

Local app for **MTTech_SARFarm@outlook.com**. Optional on the Alien — you can send from Outlook yourself.

```
python mail_app.py
```

Or double-click `Open-VA-mail.cmd`.

UI: http://127.0.0.1:8780/

Gates: [MAIL.md](../docs/MAIL.md). Cold outreach stays locked. Contact-desk dual-notify to Brian and replies to inbound desk mail are allowed.

Contact watch: Windows task `VAContactDesk` runs `watch_desk.ps1` (mail + Stripe) about every 10 minutes. Notify `moorebmoore@hotmail.com`. Do not email-to-text 706.315.3390 (Verizon ended vtext/vzwpix; T-Mobile gateway bounces). Stripe money events notify from the script. Grok is not woken on a quiet tick.

Stripe key (gitignored): `aibiz/data/stripe.env` with `STRIPE_SECRET=` a restricted or agent key that can **read** Charges, Balance, and Payouts. Do not put the main live secret in chat. Grok also has the Stripe MCP at `https://mcp.stripe.com` for interactive work.

Do not change the public site from this loop.

Does not bind 8767–8770. Does not start wake.py. Ledger/outbox are gitignored.

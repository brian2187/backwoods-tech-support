# Outlook check — on (contact desk)

Brian turned contact-mailbox monitoring back on 2026-11-15.

Watch `MTTech_SARFarm@outlook.com` (separate Outlook.com mailbox, not a Hotmail alias). Hotmail `moorebmoore@hotmail.com` is Brian's notify inbox. Add the MTTech account in Outlook so the desk can see enroll/contact mail. Take actions that do **not** change the public site. Dual-notify Brian for anything that needs review:

- Text `706.315.3390` (T-Mobile `7063153390@tmomail.net`)
- Email `moorebmoore@hotmail.com`
- Send both at the same time. Subject prefix `[VA-DESK]`.

Scripts: `aibiz/watch_contact_mail.ps1`, `aibiz/desk_notify.ps1`. Windows task `VAContactDesk` escalates unprocessed desk mail. Grok durable scheduler processes the queue.

Do not edit Less Traveled HTML/CSS or push GitHub Pages from this loop.

Local mail desk (`http://127.0.0.1:8780/`) is optional. Do not touch 8767–8770.

GitHub Pages Actions workflow was emailing Hotmail on every push (“Get Pages site failed”). Workflow file deleted (commit `53dd81d`). **Do not** re-add `.github/workflows/pages.yml`.

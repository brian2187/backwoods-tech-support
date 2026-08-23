# Pickup — Alien / travel (2026-08-23)

Repo: `brian2187/backwoods-tech-support` (public). Site review:
https://raw.githack.com/brian2187/backwoods-tech-support/main/index.html

**Open this file first on the Alien.** Paste [PROMPT.md](PROMPT.md) into a new Grok / TUI session to pick up here.

**Do not** turn GitHub Pages Actions back on — it failed every push and mailed Hotmail. Workflow file was deleted (`53dd81d`). Use raw.githack until Pages is enabled **by hand** in Settings → Pages.

**Do not send outreach** until Brian authorizes a gated send. Case: do not send until 208-304-3883 still rings.

This Dell session did **not** own the trading desk. No wake.py / TRADE_REQUEST from this work. No GrokiPhone / Chase-VDI. No GrokMemory `origin/main` pull.

---

## What this is

**Virtual Assistant** — service of Mountain Top Tech, subdivision of Something Ain't Right Farms (SAR Farms). Sagle / Less Traveled Road. After-hours (and missed) booking desk for local shops.

Email: `MTTech_SARFarm@outlook.com` (alias on `moorebmoore@hotmail.com`). Mail 15-minute scheduler is **off**.

---

## Site map

| URL | What |
|-----|------|
| [index.html](../index.html) | Public site. Heading **Local person, global skills**. |
| [login.html](../login.html) | Shop login. **Logon only**, no password. |
| [shop-andy.html](../shop-andy.html) | Andy The Handyman. Logon `andy`. |
| [shop-sherman.html](../shop-sherman.html) | Doug & Melanie. Logon `sherman`. |
| [shop-case.html](../shop-case.html) | Case Handyman Sagle. Logon `case`. |
| [site-andy.html](../site-andy.html) | Website draft ($500). Surprise — **not** in first email. |
| [site-sherman.html](../site-sherman.html) | Same. |
| [site-case.html](../site-case.html) | Same (built from directory; no public shop site). |

Login: https://raw.githack.com/brian2187/backwoods-tech-support/main/login.html

---

## Pricing (locked)

See [PRICING.md](PRICING.md).

- Setup sale **$150** (list $1,500, strikethrough on site).
- Base **$25**/mo (dedicated line).
- Desk talk **$0.75/min** (pay for what you use). Typical 3 min = $2.25.
- Usage cap **$250**/mo.
- Optional website **$500** one-time on a free host.
- Quiet month = $25. They pick up during hours: not billed.

---

## Phone model (locked)

Each shop gets a **dedicated line**. They set hours on the shop page calendar.

- During hours: ring **their** phone first. No pickup → Virtual Assistant.
- After hours / vacation days: Virtual Assistant answers. Their phone need not ring.
- Unanswered **no matter when** goes to the desk.
- Existing 208 can stay on the van; forward it to the new line or publish the new line.

**Not live.** No DID purchased. Setup-AI number is still mailto until xAI Voice Agent Builder is stood up (`setup-line.js`).

Test the xAI agent **in browser** at https://x.ai/voice or https://console.x.ai/ — mic, no phone. Each account also gets a free provisioned number for a real test call. Calls are recorded/transcribed. ~$0.05/min agent + $0.01/min tel on their number.

---

## Shop pages (what the customer sees)

- What we know (public facts, engaging copy).
- How the desk works for **their** shop (SVG flow).
- Hours calendar: checkbox “You first”, time fields, drag the green bar. Vacation month view; **wk** blocks a week.
- Save setup = `localStorage` on that browser only until Brian confirms go-live.
- **Ready to Work?** popup: did you save? If yes, mailto `MTTech_SARFarm@outlook.com` subject `Ready to work — {shop}`. If not, scroll to Save.
- Website draft is a next-step card, not in the first email.

---

## First 3 (test group)

Full pack: [first-3-prepare.md](first-3-prepare.md)

| Shop | Phone | Email | Logon | Send? |
|------|-------|-------|-------|-------|
| Andy The Handyman | 208-920-3269 | andythehandyman@protonmail.com | `andy` | Ready when Brian authorizes. Best demo. |
| Professional Handyman Sandpoint | 208-304-2062 | prohandymansandpoint@gmail.com | `sherman` | Same. Hours not public — they set on the page. |
| Case Handyman | 208-304-3883 | none found | `case` | **Do not send** until pickup confirmed. License RCT-35892 / 014348 last noted inactive Jul 2024. |

Website surprise: do not mention $500 site in first-touch email.

**Example first line (Andy):**
This is Brian Moore. I live on Less Traveled Road in Sagle, and I want to bring AI to our community — quietly, for shops like yours, not as a pitch from a city you don’t live in.

Then the after-hours desk, $150 setup, $25 + $0.75/min / $250 cap, private page URL, logon `andy`. No website pitch.

---

## Sales-ready remaining (do in order)

1. xAI account + Voice Agent Builder. Test in browser. One setup-AI number.
2. Outlook calendar on `MTTech_SARFarm@outlook.com` (or a calendar Brian owns) so qualified jobs can land.
3. Stripe or invoice for $150 (required at first yes, not required to send first email).
4. Demo on Andy’s page.
5. Case pickup check.
6. Authorize gated send of Andy, then Sherman.

Not required for first sale: custom domain, github.io, mail scheduler, a 208 per shop before the first yes.

---

## Docs in this folder

| File | What |
|------|------|
| [TRAVEL.md](TRAVEL.md) | This pickup brief. |
| [PROMPT.md](PROMPT.md) | Paste into a new Grok session to continue. |
| [PRICING.md](PRICING.md) | Locked $150 / $25 / $0.75 / $250. |
| [SHOP-LOGINS.md](SHOP-LOGINS.md) | `andy` / `sherman` / `case` (already on login.html). |
| [first-3-prepare.md](first-3-prepare.md) | Targets + gated email/SMS drafts (Less Traveled first line). |
| [offer-package.md](offer-package.md) | Offer one-pager, D-024, tracker, checklist. |
| [first-10-targets.md](first-10-targets.md) | North Idaho research pool after the first 3. |
| [MAIL.md](MAIL.md) | Mail desk rules. |
| [CHECK.md](CHECK.md) | 15-minute Outlook check is off; Pages workflow is gone. |

Mail desk source (optional, `may_send` false): [`../aibiz/`](../aibiz/). Ledger/outbox stay local and are gitignored.

---

## Ops notes

- Hotmail = connected Outlook mailbox. Alias `MTTech_SARFarm@outlook.com`.
- GitHub Actions Pages workflow **removed** (was failing and emailing Hotmail on every push). Deleted Items: 22 failure mails were moved there 2026-08-23.
- Founder overview on the public site is from Brian’s Mar 2026 resume (Army, Amex/Chase/TSYS/Huntington, PMP). Personal 706 cell was **not** published. Resume files stay on the Dell (`OneDrive\Desktop\Work\Brian Moore - Resume.doc`); not in this repo.
- Site login is client-side only. Static GitHub Pages cannot real-auth.
- Paid-SaaS hold remains. Case license possibly inactive — no Case send until pickup confirmed.

---

## Stays on the Dell (not in git)

- `C:\Dev\Revenue-Knowledge\aibiz\data\` ledger / drop / outbox / heartbeat
- Edge preview-profiles under aibiz
- `_preview_*` / `_view_*` / `_all3.html` local review hacks
- Resume .doc / older PDF
- GrokMemory origin (sealed; do not pull)

---

## Clone on the Alien

```
git clone https://github.com/brian2187/backwoods-tech-support.git
cd backwoods-tech-support
```

Open `docs/TRAVEL.md` first.

Preview the site:

```
python -m http.server 8791
```

Then http://127.0.0.1:8791/index.html and /login.html — or keep using raw.githack.

Optional mail desk (does **not** send):

```
cd aibiz
python mail_app.py
```

http://127.0.0.1:8780/ — `may_send` false. Do not bind 8767–8770. Do not start wake.py.

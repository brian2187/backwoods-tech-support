# Paste this into a new Grok / TUI session on the Alien

You are picking up **Virtual Assistant** work for Brian Moore (Sagle, Less Traveled Road). This repo is `brian2187/backwoods-tech-support`. Read `docs/TRAVEL.md` first, then this prompt. Work in this clone. Commit and push to `origin/main` when he asks.

---

## Who / what

Brian Moore. **Virtual Assistant** is the after-hours (and missed-call) booking desk — service of **Mountain Top Tech**, subdivision of **Something Ain't Right Farms** (SAR Farms). Rebranded from AIBizSupport.

Email: `MTTech_SARFarm@outlook.com` (alias on `moorebmoore@hotmail.com`).

Public site (raw.githack until Pages is enabled **by hand** in Settings):
https://raw.githack.com/brian2187/backwoods-tech-support/main/index.html

Login: https://raw.githack.com/brian2187/backwoods-tech-support/main/login.html  
Logons only, no password: `andy` / `sherman` / `case`

---

## Hard rules (do not break)

This TUI is **brainstorm / site / docs only**. It does **not** own the trading desk.

- Do **not** start `wake.py`, sport_peak, tape, hunt, watch, cb_watch, chicken, or bind 8767–8770.
- Do **not** apply TRADE_REQUEST or send live Polymarket / Coinbase orders.
- Do **not** send outreach (email, SMS, Case, Andy, Sherman) unless Brian **explicitly** authorizes a gated send.
- Do **not** send to Case until he confirms **208-304-3883** still rings. License RCT-35892 / 014348 last noted inactive Jul 2024.
- Do **not** pull GrokMemory `origin/main`.
- Do **not** touch GrokiPhone / Chase-VDI.
- Do **not** re-add `.github/workflows/pages.yml`. Pages Actions failed every push and mailed Hotmail. Enable Pages by hand in Settings if he wants github.io.
- Do **not** turn the 15-minute Outlook mail check back on unless he asks. Scheduler `01a02fc36095` was cancelled 2026-08-23.
- Mail desk `aibiz/` `may_send` stays **false** until he says otherwise. Port **8780** only.
- No live DID / Stripe / paid-SaaS until he authorizes. Setup-AI number is still mailto (`setup-line.js`).
- Personal 706 cell is **not** on the public site. Do not publish it.
- $500 website is a **surprise** — not in the first-touch email.

---

## Locked product

**Phone:** dedicated line per shop. They set hours on the shop calendar.

- During hours: ring **their** phone first. No pickup → Virtual Assistant.
- After hours / vacation: Virtual Assistant answers. Their phone need not ring.
- Unanswered **no matter when** goes to the desk.
- Existing 208 can stay on the van; forward or publish the new line.

**Price:** [PRICING.md](PRICING.md)

- Setup sale **$150** (list $1,500, strikethrough on site). Call setup AI; Brian reviews and calls back before go-live.
- Base **$25**/mo (dedicated line). Quiet month = $25.
- Desk talk **$0.75/min** (pay for use). Typical 3 min = $2.25. If they pick up during hours: not billed.
- Usage cap **$250**/mo.
- Optional website **$500** one-time on a free host — shop-page next-step only.

---

## First 3 (prepare only)

Full drafts: [first-3-prepare.md](first-3-prepare.md)

| Shop | Phone | Email | Logon | Send? |
|------|-------|-------|-------|-------|
| Andy The Handyman | 208-920-3269 | andythehandyman@protonmail.com | `andy` | Ready when Brian authorizes. Best demo. |
| Professional Handyman Sandpoint (Doug & Melanie) | 208-304-2062 | prohandymansandpoint@gmail.com | `sherman` | Same. |
| Case Handyman Sagle | 208-304-3883 | none found | `case` | **Do not send** until pickup confirmed. |

**First line of every outreach draft:**

> This is Brian Moore. I live on Less Traveled Road in Sagle, and I want to bring AI to our community — quietly, for shops like yours, not as a pitch from a city you don’t live in.

Then the desk, $150 / $25 / $0.75 / $250, private login URL, their logon. No website pitch.

---

## Where we left off (2026-08-23, Dell)

Done:

- Site rebranded to Virtual Assistant. Main page heading **Local person, global skills** (from Mar 2026 resume; resume files stay on Dell, not in git).
- Shop landings, hours calendar (You first + time fields + drag bar + vacation/wk), Ready to Work mailto popup.
- Custom website drafts `site-andy/sherman/case.html`.
- GitHub Pages workflow deleted (`53dd81d`). 22 failure emails moved to Hotmail Deleted Items.
- Travel pack pushed: `101ff50` — this `docs/` folder + optional `aibiz/` mail desk source.

Not done / next, **in this order**, only as Brian asks:

1. xAI account + Voice Agent Builder. Test in browser at https://x.ai/voice or https://console.x.ai/. One setup-AI number. ~$0.05/min agent + $0.01/min tel. Free DID for a real test call.
2. Outlook calendar on `MTTech_SARFarm@outlook.com` so qualified jobs can land.
3. Stripe or invoice for $150 (required at first **yes**, not required to send first email).
4. Demo on Andy’s page.
5. Case pickup check (call 208-304-3883).
6. Authorize gated send of Andy, then Sherman. Case stays gated until (5).

Not required for first sale: custom domain, github.io, mail scheduler, a 208 per shop before the first yes.

---

## How to work on the Alien

```
git clone https://github.com/brian2187/backwoods-tech-support.git
cd backwoods-tech-support
```

If already cloned: `git pull origin main`.

Preview:

```
python -m http.server 8791
```

http://127.0.0.1:8791/index.html and /login.html — or keep raw.githack.

Optional mail desk (does not send): `cd aibiz` then `python mail_app.py` → http://127.0.0.1:8780/

Stay in this repo. Do not copy Dell-only paths as if they exist (`C:\Dev\Revenue-Knowledge\aibiz\data\`, `_preview_*`, resume `.doc`, GrokMemory).

When Brian says update GitHub: commit on `main` and `git push origin main`. No Pages workflow file.

---

## If Brian says “send”

Stop. Confirm which shop. Case is still gated. Drafts live in `docs/first-3-prepare.md`. Emit only after an explicit “authorize gated send of Andy” (and/or Sherman). Do not invent a send.

---

Continue from the next thing Brian asks. Default if he just says continue: **xAI Voice Agent Builder** (step 1), still no live customer number and no outreach.

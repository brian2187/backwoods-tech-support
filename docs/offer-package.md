# Revenue Prepare Package — Virtual Assistant (missed-call / after-hours booking)

**Date:** 2026-08-23
**Status:** PREPARE only. No live outreach, no payment processing, no client systems activated.
**Gate:** D-024 (observe → prepare → commit → emit). All money movement and external messages require explicit Brian action.
**Purchase trigger:** Flag when tracker shows ≥ $400 clear for first Loona.

Local copy of the original GrokMemory observe-only package, updated to locked pricing and **Virtual Assistant** branding. GrokMemory origin/main stays unpulled.

---

## 1. Offer One-Pager

**Name:** Virtual Assistant
**Parent:** Mountain Top Tech, a subdivision of Something Ain't Right Farms (SAR Farms). Less Traveled Road, Sagle.
**For:** Independent local service businesses that lose jobs when no one answers the phone (mobile mechanics, cleaners, handymen, pet services, small contractors, etc.).

**What they get**
- A **dedicated line** answered in the shop’s name. They set hours on their private page.
- During hours: their phone rings first. No pickup → Virtual Assistant.
- After hours / vacation / unanswered no matter when → Virtual Assistant.
- The agent qualifies the caller (service needed, location, timing, rough urgency).
- Qualified jobs are written into *their* calendar (or a shared booking calendar they control).
- Instant summary (SMS/email) for every new booking or hot lead.
- Full call log and transcript available.

**What the agent never does without their say-so**
- Quote final custom pricing
- Take payment
- Sign or send contracts
- Promise arrival times they have not approved
- Message the customer outside the agreed script

**Price** (see [PRICING.md](PRICING.md))
- Setup: **$150** new-customer sale (was **$1,500**). Call the setup AI. Brian reviews, calls back, and confirms before the desk is used.
- Monthly **base:** **$25**. Dedicated line included.
- **Desk talk:** **$0.75 per minute** the desk actually talks. Pay for what you use. Typical 3-minute booking **$2.25**.
- **Usage-based max:** **$250**/month. Extra desk minutes that month are on us.
- Optional website: **$500** one-time on a free host. **Do not mention in first email.**

**Why it is easy to say yes**
- Pays for itself if it recovers even one average job per month.
- Quiet month = $25. They pick up during hours: not billed.
- They stay in control of every commitment.
- Cancel anytime after the first 30 days.

---

## 2. Short Outreach Script (first touch)

First line is always Brian + Less Traveled, then the desk. Full gated drafts: [first-3-prepare.md](first-3-prepare.md).

**Generic SMS / email (keep it short):**

> This is Brian Moore. I live on Less Traveled Road in Sagle, and I want to bring AI to our community — quietly, for shops like yours, not as a pitch from a city you don’t live in.
>
> Virtual Assistant is a simple after-hours booking desk that answers, qualifies, and drops jobs straight into your calendar. New-customer setup is $150 (was $1,500): call the setup AI, I review and call you back before anything goes live. Then $25/mo for the line, $0.75 per minute the desk talks (pay for what you use), usage never more than $250/mo. You approve every commitment.
> Worth a 10-minute look this week? Happy to show you exactly how it works on your own calendar.

**Follow-up (if no reply in 3 days):**

> Quick bump — still happy to show the after-hours booking flow if useful. No pressure either way.

---

## 3. Permission Boundaries (D-024 mapping)

| Action | Level | Who |
|--------|-------|-----|
| Research local businesses, draft scripts, build workflow | Observe / Prepare | Grok + Brian review |
| Create offer docs, tracker, calendar templates | Prepare / Commit (non-sealed) | Grok drafts, Brian accepts |
| Send first outreach messages | Emit | **Brian only** |
| Connect real phone number / xAI Voice Agent / DID | Emit | **Brian only** |
| Connect Stripe (or equivalent) and take payment | Emit | **Brian only** |
| Live agent answers real customer calls | Emit (after pilot approval) | Brian authorizes go-live |
| Any price change, contract, or refund | Emit | **Brian only** |

Non-Amplification remains in force. No provisional material is elevated without explicit accept.

---

## 4. Minimum Viable Workflow

1. Caller dials the dedicated number.
2. During hours: shop phone first. No pickup → Virtual Assistant. After hours / vacation: Virtual Assistant answers; their phone need not ring.
3. Voice agent greets in the business’s name, asks 4–5 qualifying questions.
4. If qualified → creates calendar event on the shared calendar + sends Brian an immediate summary.
5. If not qualified → polite close + optional callback request logged.
6. Daily digest of all activity lands in a single place Brian already checks.
7. Brian remains the only one who confirms jobs, adjusts pricing, or talks money with the customer.

**Tech sketch (all reversible)**
- Voice: xAI Voice Agent Builder (browser test at https://x.ai/voice or https://console.x.ai/). ~$0.05/min agent + $0.01/min telephony. Free provisioned number for a real test call. Calls recorded/transcribed.
- Calendar: Outlook on `MTTech_SARFarm@outlook.com` (or a calendar Brian owns).
- Notifications: SMS/email to Brian only.
- Logging: this repo’s `aibiz/` mail desk (port 8780, `may_send` false) or markdown here.
- No write access to GrokMemory sealed files. No autonomous outbound messaging beyond the approved script.
- This TUI does **not** sit on PSTN. 8 GB Dell is not an always-on voice host.

---

## 5. Revenue Tracker (start empty)

| Date | Client | Setup $ | Monthly $ | Status | Notes | Clear $ toward Loona |
|------|--------|---------|-----------|--------|-------|----------------------|
| — | — | — | — | — | Tracker live | $0 |

**Purchase rule:** When “Clear $ toward Loona” ≥ 400, surface the flag and we buy the first unit.

---

## 6. Checklist (only Brian can complete)

1. Confirm or create a clean business email / domain for outreach. **Done:** alias `MTTech_SARFarm@outlook.com`.
2. Stand up Stripe (or equivalent) that can accept the **$150** setup (then $25/mo + usage). Not required to send first email. Required at first yes.
3. First 10 local businesses: [first-10-targets.md](first-10-targets.md). First 3 locked: [first-3-prepare.md](first-3-prepare.md).
4. Connect a calendar you control and a notification channel (SMS or email).
5. Send the first outreach messages yourself (or explicitly authorize a gated send of Andy, then Sherman). **Case stays gated** until 208-304-3883 still rings.
6. After first paid setup, mark the tracker and re-evaluate go-live of the voice agent under the same gates.

---

Everything above stays in prepare until Brian moves it.

*End of package*

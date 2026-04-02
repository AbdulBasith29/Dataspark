# DataSpark — Referral Loop Specification

Product and growth spec for the waitlist **referral program** (“move up the waitlist,” rewards, leaderboard). Includes **KPI baselines**, **hypotheses**, **variants**, **sample size assumptions**, and **decision rules**.

## Goals

1. Increase **organic** waitlist growth without paid spend.
2. Reward **high-intent** users who bring **similar** candidates.
3. Keep **fraud** and **gaming** manageable at low engineering cost.

---

## User-facing mechanics (reference)

Aligned with marketing playbook:

- **Copy:** “Refer 3 friends → get 1 month free” (post-launch reward).
- **Waitlist:** “Move up the waitlist” via unique share link.
- **Leaderboard:** top referrers earn **lifetime access** (cap total winners to control cost).

This spec adds **implementation and measurement** detail.

---

## Core flows

### Flow 1 — Share

1. User completes waitlist signup → receives **unique referral URL** `?ref={code}` or path `/join?ref=`.
2. **Primary surfaces:** post-signup confirmation page, welcome email (hero CTA), optional SMS later.
3. User copies link or uses **native share** where available.

### Flow 2 — Attribute

1. New visitor lands with `ref` param → store **first-touch** referral code in cookie/localStorage (TTL **30 days**).
2. On successful signup, attach **referrer_user_id** if code valid and **not self-referral**.

### Flow 3 — Reward

**Waitlist phase:**

- Each successful referral adds **+N positions** up or **points** toward tier unlock (see variants).

**Launch phase:**

- After **K verified referrals**, credit **1 month free** to referrer account (coupon or Stripe metadata).

**Leaderboard:**

- Rank by **successful referrals** in period **T** (e.g., launch window); **top M** win lifetime access subject to **fraud review**.

---

## KPI baselines

| KPI | Baseline (early) | Notes |
|-----|------------------|--------|
| % signups who **copy/share** link within 24h | **8–15%** | Strong onboarding dependency |
| **Referrals per active sharer** (30d) | **0.05–0.25** | Most users share 0 |
| **Signup → attributed referral** conversion | **15–35%** of clicks | Depends on landing match |
| **Fraudulent** or duplicate referrals | **<2%** of attributed | Phone/email/IP checks |
| **k-coefficient** (naive) | **0.05–0.15** | `invites × conversion`; track as directional |

---

## Hypotheses

1. **H1:** **Post-signup modal** with one-click copy raises **share rate** more than email-only **without** hurting email confirmation rates.
2. **H2:** **Leaderboard** increases top-quartile activity but may add **low-quality** invites — net effect must be measured.
3. **H3:** **Double-sided** reward (friend gets priority too) improves **conversion** of referral links more than single-sided.

---

## Variants (A/B)

| ID | Mechanic | Description |
|----|----------|-------------|
| R-A | **Points** | +100 pts per qualified signup; tiers unlock perks |
| R-B | **Position boost** | +50 spots per referral (communicate clearly to avoid distrust) |
| R-C | **Double-sided** | Referee sees “You’ve been invited — you’re bumped up too” |

**Pre-launch simplification:** ship **R-A or R-B** first; add **R-C** when engineering allows **dynamic** referee messaging.

---

## Sample size assumptions

- **Primary metric for product test:** **share rate** within 24h of signup (binary).
- If **p0 = 10%**, detecting **+2 pp** (10% → 12%) needs **~5,400** users per variant (α=0.05, power=0.8).
- **Practical approach:** pre-register **MDE = +3 pp** with **~2,400** per arm **or** run **6–8 weeks** with **weekly** readout and **fixed** stop date.
- **Leaderboard** effect: compare **distribution** of referrals — expect **heavy-tailed** data; use **percentile** metrics (P90 referrals) not just means.

---

## Decision rules

| Decision | Rule |
|----------|------|
| **Ship modal** | **Share rate ↑ ≥ +2 pp** absolute vs control for **2 weeks**, **email confirm rate** not down **>1 pp** |
| **Keep leaderboard** | **Total qualified signups ↑** vs prior period **and** fraud **<3%**; **sunset** if median user **stress** signals (support tickets) **↑** |
| **Change reward** | If **k** flat but **share rate** high, problem is **referee conversion** — test **double-sided** and **landing** before raising rewards |
| **Pause program** | Fraud **>5%** for **1 week** or **brand** risk on social — switch to **manual** review for top accounts |

---

## Anti-fraud (minimum)

- **Disallow** same **payment method**, **phone**, or **device fingerprint** for referrer + referee if collected later.
- **Rate limit:** max **N** attributed signups per **referrer per day** (e.g., 20) pending review.
- **Disposable email** blocklist on referee signups.
- **Manual review** for leaderboard finalists.

---

## Instrumentation (events)

| Event | When |
|-------|------|
| `referral_link_generated` | Code created |
| `referral_link_copy` | User copies |
| `referral_link_share` | Native share used |
| `referral_landing` | Visit with `?ref` |
| `referral_signup_attributed` | Signup with valid ref |
| `referral_reward_earned` | Tier hit |

**Properties:** `referrer_id`, `campaign` (waitlist vs launch), `surface` (modal, email, …).

---

## Operational policies

- **Communication:** exact rules for **what counts** as a referral (confirmed email only, etc.).
- **Payout cost cap:** max **lifetime** seats given per quarter — document in finance appendix.
- **Support macros** for “my friend signed up but I didn’t get credit.”

---

## Open questions

- Double opt-in for email — does referral count on **confirm** only? **Recommended:** yes.
- International — **GDPR** consent for sharing email with referrer? **Recommended:** do not expose PII; show **counts** only.

---

## Owners

- **growth-agent:** positioning, copy, A/B plan.
- **Engineering:** attribution, events, anti-abuse hooks.
- **Review:** monthly on **k**, **fraud %**, and **CPA equivalent** of referral rewards vs projected paid CAC.

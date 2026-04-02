# DataSpark — Growth Experiments

Purpose: prioritize and run disciplined tests across channels, landing, and lifecycle. Every experiment below lists **baseline KPIs**, **hypothesis**, **variants**, **sample size assumptions**, and **decision rules**.

## How to use this doc

1. Pick one primary metric (guardrails listed per experiment).
2. Run one variant against control until decision rules fire or max duration.
3. Log outcome in a simple sheet: start date, end date, winner, learnings, follow-up.

**Global conventions**

- **α = 0.05** (two-sided unless noted) for “statistically significant.”
- **Minimum detectable effect (MDE)** is the smallest lift we care to detect for a **go** decision; smaller lifts may still be monitored.
- **Sequential peeking:** avoid daily “peeking” stops before n_min; use fixed horizons or a pre-registered check schedule (e.g., weekly).

---

## Baseline KPI snapshot (starting assumptions — replace with live data)

| Area | Metric | Baseline (pre-launch / early) | Notes |
|------|--------|--------------------------------|--------|
| Landing | Visit → signup CVR | 12–18% | Wide until traffic stabilizes |
| Landing | Bounce on hero | 45–60% | Mobile often higher |
| Email | Welcome open rate | 45–55% | Transactional skews high |
| Email | D3 nurture open | 25–35% | |
| Social (paid = $0 initially) | Profile → link click | 0.5–2% | Highly variable by post |
| Referral | Signups with ≥1 referral | 5–15% | After mechanic is live |

---

## Experiment backlog (prioritized examples)

### EXP-01 — Landing hero value proposition

| Field | Content |
|-------|---------|
| **Primary metric** | Signup conversion rate (session-level: unique sessions with signup / sessions) |
| **Guardrails** | Time on page (not ↓ >15% vs control), spam/bot signups (not ↑) |
| **Hypothesis** | A sharper contrast with “syntax-only” prep tools will increase qualified signups because visitors immediately recognize the differentiation. |
| **Control (A)** | “StrataScratch teaches syntax. DataSpark teaches thinking.” |
| **Variant B** | Lead with outcome: “Pass the interview questions that bootcamps never cover.” |
| **Variant C** | Lead with proof mechanism: “Practice with scenarios from real DS interviews — not LeetCode-style drills.” |
| **Sample size** | Assume **p0 = 15%** CVR. To detect **absolute +3 pp** lift (15% → 18%) with **80% power** and **α = 0.05**, plan for roughly **~2,100 sessions per arm** (order of magnitude; use a calculator with exact p0). If traffic is low, **extend duration** or accept **MDE = +5 pp** (~560/arm). |
| **Decision rules** | **Ship** if primary beats control by **≥MDE** and guardrails hold for **2 consecutive weeks**. **Iterate** if directional (+1–2 pp) but under MDE. **Discard** if worse than control after full n or **4 weeks** fixed horizon with no lift. |

### EXP-02 — Email capture friction

| Field | Content |
|-------|---------|
| **Primary metric** | Signups / landing session |
| **Guardrails** | Email validity rate, later launch-day unsubscribe |
| **Hypothesis** | Collecting only email (vs email + name) reduces drop-off without hurting lead quality. |
| **Control** | Email + first name |
| **Variant** | Email only |
| **Sample size** | Same framework as EXP-01 on **session** CVR; if expected lift is **relative 10%** on a **12%** baseline, need larger n than +3 pp absolute — pre-register **MDE** before launch. |
| **Decision rules** | **Ship** variant if **signup rate ↑** with **no meaningful ↑ in bounces** and invalid email rate **≤ control + 0.2 pp**. **Revert** if signup ↑ but downstream engagement ↓ on a holdout cohort (10%). |

### EXP-03 — Social proof line on landing

| Field | Content |
|-------|---------|
| **Primary metric** | Signup CVR |
| **Hypothesis** | Specificity beats round numbers: “Join 2,847 learners” converts better than “Join 2,000+” when the number is believable and updated. |
| **Control** | “Join 2,000+ data scientists on the waitlist.” |
| **Variant** | Dynamic exact count (or last updated: “Join **X** learners — updated weekly”). |
| **Sample size** | **~1,500+ sessions per arm** for **+2–3 pp** MDE at **~15%** baseline (rule of thumb). |
| **Decision rules** | **Ship** if lift **≥ +2 pp** and no increase in support tickets / distrust signals. **Hold** if numbers fluctuate and cause confusion — then switch to banded copy (“2,500–3,000”). |

### EXP-04 — Referral CTA placement

| Field | Content |
|-------|---------|
| **Primary metric** | % of new signups who copy referral link within 24h |
| **Hypothesis** | Post-signup modal + email beat footer-only because intent is highest at confirmation. |
| **Control** | Referral link in footer of welcome email only |
| **Variant** | Interstitial after signup + welcome email |
| **Sample size** | If baseline **p0 = 8%**, detecting **+2 pp** needs **~2,000 signups per arm**; if **n is small**, use **Bayesian** reporting or lengthen to **8 weeks** and pre-register **decision rule** based on **practical significance** (e.g., **+1 pp** + stable weekly trend). |
| **Decision rules** | **Ship** if **+relative 25%** on primary **and** referred signups **↑**. **Reject** if modal **↑** share rate but **↓** email confirmations (unintended friction). |

---

## Sample size cheat sheet (two-proportion, rough)

Use a calculator for exact numbers; this table is for planning.

| Baseline CVR | MDE (absolute pp) | Approx. sessions per arm (α=0.05, power=0.8) |
|--------------|-------------------|-----------------------------------------------|
| 10% | +2 pp | ~3,600 |
| 15% | +3 pp | ~2,100 |
| 20% | +4 pp | ~1,300 |
| 25% | +5 pp | ~900 |

**Low traffic protocol:** run **sequential** weekly checks with **pre-registered** stop: e.g., “If after 4 weeks both arms within **±1 pp** and **<500** sessions/arm, **pick control** and redesign test.”

---

## ICE scoring (prioritization)

| Experiment | Impact (1–10) | Confidence (1–10) | Ease (1–10) | ICE |
|------------|---------------|-------------------|-------------|-----|
| Hero copy | 9 | 7 | 9 | 25 |
| Email-only capture | 6 | 8 | 10 | 24 |
| Referral modal | 7 | 6 | 7 | 20 |

Re-score monthly as baselines update.

---

## Roles

- **Owner:** growth-agent (hypothesis + design).
- **Implementer:** frontend/landing for splits; analytics for event taxonomy.
- **Review:** weekly — decision only when rules met; avoid ad-hoc stops.

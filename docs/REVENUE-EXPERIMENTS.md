# DataSpark — Revenue Experiments

## Purpose

Run **pricing**, **packaging**, and **paywall placement** tests with explicit **conversion metrics**, **guardrails**, and **rollout stages**. Complements `MONETIZATION-STRATEGY.md`, `PRICING-HYPOTHESES.md`, `PACKAGING-MATRIX.md`, and `PAYWALL-TRIGGER-SPEC.md`.

---

## North-star and supporting metrics

| Metric | Definition | Target direction |
|--------|------------|------------------|
| **Activated learner** | Completed ≥1 lesson + ≥3 questions in first 7 days | ↑ |
| **Trial start rate** | Trials / eligible signups (when trial exists) | ↑ |
| **Trial → paid conversion** | Paid subs / trials ended | ↑ |
| **Checkout → success** | Successful payment / checkout started | ↑ |
| **ARPA** | Revenue / paying accounts (period) | ↑ |
| **Net revenue retention (NRR)** | Cohort expansion − churn (Team focus, later) | ↑ |
| **D30 retention** | Active on D30 / signups | Stable or ↑ |
| **Tutor cost per paying user** | AI COGS / paying users | ↓ or flat with ARPA ↑ |
| **Support tickets / 1k MAU** | Tickets tagged billing/access | ↓ or flat |

### Conversion funnel (instrument first)

`signup` → `lesson_complete` → `question_submit` → `paywall_impression` → `checkout_start` → `subscribe_success`

---

## Guardrails (global)

Experiments **auto-pause** or **revert** if any trigger fires (thresholds tuned with volume):

| Guardrail | Example threshold | Action |
|-----------|-------------------|--------|
| **Conversion collapse** | Trial→paid −25% vs. 14d baseline | Pause + revert |
| **Checkout failure spike** | Success rate −15 pts | Pause; investigate payments |
| **Churn spike** | D30 cancel rate +10 pts vs. cohort | Pause |
| **Refund / chargeback spike** | Refunds > 2× baseline | Pause |
| **Support pain** | Billing tickets +50% vs. 4w avg | Pause |
| **Tutor COGS** | Cost / MAU +30% without ARPA lift | Pause; cap usage |

All experiments need: **owner**, **start date**, **hypothesis ID** (`PRICING-HYPOTHESES.md`), **minimum sample / runtime**.

---

## Rollout stages

| Stage | Goal | Typical changes | Notes |
|-------|------|-----------------|--------|
| **A — Instrumentation** | Trust the funnel | Events, identity merge, pricing page canonical URLs | No user-facing price changes |
| **B — Soft monetization** | Learn sensitivity | Inline paywalls, banners, “approaching limit” toasts | No hard blocks on core nav |
| **C — Hard entitlements** | Revenue capture | Daily caps, locked questions, tutor gates per spec | Monitor guardrails weekly |
| **D — Price & packaging tests** | Optimize ARPU/LTV | Price bands, annual discount, trial length | One big knob per cell |
| **E — Expansion** | Team & B2B | Team checkout, seats, admin | Separate funnel metrics |

Promotion between stages requires: green light on **error budgets** (client/API), **billing** test mode sign-off, and **support** macro FAQ.

---

## Experiment backlog (prioritized)

### E1 — Free daily question cap (Stage C)

- **Hypothesis:** A clear cap increases upgrades without killing activation.
- **Variants:** Cap A vs. Cap B (e.g. 5 vs. 10); control only if ethical/perf allows.
- **Primary metric:** Upgrade rate from free.
- **Guardrails:** D7 activation, session depth.

### E2 — Tutor message cap (Stage C)

- **Hypothesis:** Tutor is high-WTP driver; caps convert if messaging is clear.
- **Variants:** Message cap 15 vs. 25 / day on Free.
- **Primary metric:** Free→Pro from tutor paywall.
- **Guardrails:** Tutor CSAT (in-product), COGS/user.

### E3 — Paywall placement: post-success (Stage B→C)

- **Hypothesis:** Paywall **after** correct answer or lesson complete has higher intent than on entry.
- **Variants:** Entry vs. exit of flow.
- **Primary metric:** `paywall_impression` → `subscribe_success`.
- **Guardrails:** Bounce from practice sessions.

### E4 — Annual default (Stage D)

- **Hypothesis:** Pre-selected annual increases LTV with acceptable monthly volume drop.
- **Variants:** Annual default vs. monthly default on pricing.
- **Primary metric:** Blended ARPU new subs.
- **Guardrails:** Refund rate at 14d.

### E5 — Trial length (Stage D)

- **Hypothesis:** 7d vs. 14d trial balances activation vs. tire-kickers.
- **Variants:** 7 / 10 / 14 days (pick 2 for A/B).
- **Primary metric:** Paid conversion post-trial.
- **Guardrails:** Support volume (“forgot to cancel”).

### E6 — Team min seats & price (Stage E)

- **Hypothesis:** Min 3 seats + seat discount drives ARPA without killing solo Pro.
- **Variants:** Min seats 2 vs. 3; price −10% vs. control.
- **Primary metric:** Team ARPA, expansion revenue.

---

## Experiment record (template)

Use one row per experiment in your tracker (sheet/Notion):

| Field | Example |
|-------|---------|
| ID | E2 |
| Stage | C |
| Status | running / paused / shipped |
| Hypothesis | P4 |
| Start / end | dates |
| Audience | % rollout, locale |
| Variants | names |
| Primary metric | |
| Guardrails | |
| Result | summary + decision |

---

## Review cadence

- **Weekly** during Stage C–D: funnel, guardrails, COGS.
- **Post-experiment:** Document winner/loser; update `PRICING-HYPOTHESES.md` and `PACKAGING-MATRIX.md` version.

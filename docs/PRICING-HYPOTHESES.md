# DataSpark — Pricing Hypotheses

## Purpose

Document falsifiable assumptions about willingness to pay (WTP), packaging, and discounting. Each hypothesis maps to experiments in `REVENUE-EXPERIMENTS.md` and tier limits in `PACKAGING-MATRIX.md`.

## Hypothesis format

For each: **belief**, **evidence we’d accept**, **kill/pivot criteria**, **owner** (product/ growth).

---

## P1 — Pro monthly anchor

**Belief:** A **$29–$39/month** Pro price maximizes near-term revenue for solo learners before brand strength justifies a higher list price.

**Evidence:** Pro trial→paid conversion stable or up vs. control; annual mix ≥ 35%; refund/chargeback rate within guardrails.

**Kill/pivot:** Conversion drops >20% relative with no ARPU lift; support volume spikes on “too expensive.”

---

## P2 — Annual discount depth

**Belief:** **~35–45% effective discount** vs. 12× monthly (e.g. ~$199–$249/year at $29–$39/mo equivalent) improves LTV without hurting monthly demand.

**Evidence:** Annual share of new subs increases; blended ARPU up; churn at 90 days not worse than control.

**Kill/pivot:** Annual uptake flat but margin compresses; churn rises due to upfront regret.

---

## P3 — Team seat multiplier

**Belief:** Teams pay **1.4–1.8×** per-seat vs. individual Pro for admin + shared seats, up to a small seat minimum (e.g. 3).

**Evidence:** Team trial→paid ≥ Pro solo; expansion (add seats) within 60 days ≥ baseline.

**Kill/pivot:** Solo discounting cannibalizes Team; seats stuck at minimum.

---

## P4 — Tutor as premium driver

**Belief:** Tutor message limits are a **primary** upgrade reason (not just question count).

**Evidence:** Paywall impressions citing tutor ≥ 40% of upgrade attributions (survey or in-product); Pro cohorts with high tutor use retain better.

**Kill/pivot:** Users upgrade for questions only; tutor satisfaction low — fix product before raising tutor price weight.

---

## P5 — Price framing

**Belief:** Framing Pro as **“less than one coffee/week”** or **“one mock interview”** lifts intent without cheapening brand when rotated with neutral copy.

**Evidence:** CTR on pricing CTAs +5–15%; no increase in refunds.

**Kill/pivot:** CTR up but paid conversion down (curiosity clicks); brand survey dip.

---

## P6 — Regional / PPP (later)

**Belief:** **India / LATAM / EE** can support **PPP-adjusted** monthly pricing without arbitrage destroying US ARPU if purchase is locale-locked.

**Evidence:** Volume up in target regions; net revenue up; fraud/chargeback contained.

**Kill/pivot:** VPN abuse or card fraud spikes; US revenue cannibalized.

---

## Default price table (working — not a commitment)

| Plan | Monthly (USD) | Annual (USD) | Notes |
|------|-----------------|--------------|--------|
| Free | $0 | $0 | Acquisition |
| Pro | $29–$39 | $199–$279 | Run band tests |
| Team / seat | $39–$49 | $269–$349 | Min seats, admin |

Exact numbers go live only after **Stage C** price experiments (`REVENUE-EXPERIMENTS.md`).

## Guardrails (pricing-specific)

- No simultaneous changes to **price**, **trial length**, and **paywall placement** in one experiment.
- Document **currency and tax** display rules before international tests.
- **One** canonical price page per locale to avoid SEO/ads mismatches.

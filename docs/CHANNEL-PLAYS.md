# DataSpark — Channel Plays

Tactical plays per channel with **KPI baselines**, **hypotheses**, **variants** to test, **sample size assumptions**, and **decision rules**. Grounded in organic-first, waitlist-led growth.

---

## Cross-channel baseline table (early stage)

| Channel | Primary KPI | Baseline | Secondary KPI |
|---------|-------------|----------|----------------|
| TikTok | Views → profile/ link clicks | **0.3–1.2%** click-through (bio) | Follower growth |
| Instagram Reels | Same | **0.2–1.0%** | Saves per post |
| LinkedIn | Post impressions → link clicks | **0.8–3.5%** | Comments (quality) |
| X/Twitter | Impressions → link clicks | **0.5–2%** | Profile visits |
| Reddit / community | Helpful answer → profile click | **0.1–0.5%** (rare but high intent) | Ban risk (guardrail) |
| Email outbound | Opens → clicks | Opens **25–45%**, clicks **3–8%** | Unsub |

*Baselines vary wildly by creative; use your **own 4-week rolling** as soon as possible.*

---

## Channel play: TikTok / Reels (primary reach)

### Strategy

- **Pillars:** Interview gap, quick explainers, scenarios, build-in-public (see marketing playbook).
- **Cadence:** 1–2/day TikTok; cross-post Reels.

### Hypotheses

1. **H1:** “POV / scenario” hooks outperform generic tips for **watch-through** and **bio clicks**.
2. **H2:** Faceless slideshows + trending audio scale faster than talking-head for **top-of-funnel**.

### Variants to rotate (creative tests)

| ID | Hook style | Example direction |
|----|------------|-------------------|
| T-A | POV pain | “POV: You only studied SQL and they ask you to diagnose a metric drop” |
| T-B | Contrarian | “Stop grinding LeetCode if you want a DS role” |
| T-C | Curiosity | “The p-value question that trips up 90% of candidates” |

**Posting test:** same hook family **3 posts** minimum before judging; **one variable** (hook vs format) per week.

### Sample size assumptions

- **Engagement rate** (6s watch / view) stabilizes around **~30–50 posts** per style for directional reads; **link clicks** are sparse — aggregate **monthly**.
- **Decision:** compare **median** link clicks per post **per style** after **n ≥ 12** comparable posts each; use **Wilcoxon** or simple **median** if distributions are skewed.

### Decision rules

- **Scale** a style if **bio link CTR** **≥1.5×** the other over a month **and** no **negative** comment sentiment spike.
- **Kill** a style if **median views <25th percentile** account baseline for **2 weeks** despite hook swaps.
- **Guardrail:** if **follower growth** ↑ but **waitlist** flat, audit **landing match** and **CTA** in bio (funnel issue, not channel).

---

## Channel play: LinkedIn (primary conversion)

### Strategy

- Long-form **problem/solution**, **contrarian**, **build in public**; soft CTA to waitlist in comments or featured link.

### Hypotheses

1. **H1:** One strong story arc beats generic tips for **comment depth** and **link clicks**.
2. **H2:** “Interviewed 200 candidates”-style authority claims lift **CTR** if credible (avoid unverifiable extremes).

### Variants

| ID | Format | CTA placement |
|----|--------|----------------|
| L-A | Short paragraph + line breaks | Link in first comment |
| L-B | Long narrative | Link at end |
| L-C | Poll + follow-up post with link | Second post |

### KPI baselines

- **CTR** (impression → link): **0.8–3.5%**; **save/share** as quality signal.
- **Hypothesis:** LinkedIn drives **fewer but higher-intent** clicks than TikTok.

### Sample size assumptions

- Per post variance is huge; **minimum 8 posts per variant** over **4 weeks** before comparison.
- Aggregate **clicks / impressions** across variant buckets; **MDE** at post level often **infeasible** — use **directional + cumulative**.

### Decision rules

- **Double down** on variant if **cumulative CTR** **+30% rel.** vs other over **8 posts** each.
- **Stop** authority-style claims if **any** credibility challenge in comments without proof — pivot to **demonstrable** build logs.

---

## Channel play: X / Twitter

### Strategy

- Short hooks, **threads** for “how to answer X interview question,” daily tips.

### Hypotheses

- Thread hooks with **numbered steps** get more **profile visits** than single tweets.

### Variants

- **Single hot take** vs **thread** (same topic).
- **CTA:** pinned waitlist tweet vs link in every thread **part 1**.

### Baselines & rules

- Expect **lower CTR** than LinkedIn but **faster iteration**.
- **Decision:** **weekly** theme review; keep theme if **link clicks + profile visits** combined **↑** week-over-week **2× in a row**.

---

## Channel play: Reddit / Discord (trust-first)

### Strategy

- Value-first answers; product mention only when **directly** relevant; track **removed** posts as **guardrail**.

### Hypotheses

- **Deep technical help** on one thread drives **higher signup quality** than volume spam.

### Variants

- Template A: answer only  
- Template B: answer + “I’m building X — happy to share resource if useful” **once** per thread

### Sample size

- Low volume: judge over **quarter**, not week; **minimum 20** meaningful contributions before evaluating attributed signups.

### Decision rules

- **Continue** if **moderator friction** zero and **attributed signups ≥1/month** with **high** session quality.
- **Abort** approach if **warnings** or **bans** — switch to **DM-first** relationship building.

---

## Channel play: Email (lifecycle)

### Strategy

- Sequences per marketing playbook (D0, D3, D7…).

### Hypotheses

- **Value-first PDF** (D3) increases **forward/share** and **later** launch conversion.

### Variants

- Subject line A vs B on **D3** (educational vs curiosity).
- **Plain** vs **rich** HTML (guardrail: deliverability).

### Sample size

- For **open rate** ~30%, detecting **+5 pp** needs **~1,000** recipients per variant.
- **Click rate** lower — **~2,500+** per variant for **+1 pp** on **3%** baseline.

### Decision rules

- **Winner** on **opens** must not have **higher unsub**; **tie-break** by **click-to-site**.

---

## Budget and time allocation (organic)

| Channel | Time % (suggested) | Rationale |
|---------|-------------------|-----------|
| TikTok/Reels | 40% | Reach |
| LinkedIn | 25% | Conversion |
| Twitter | 15% | Iteration |
| Community | 10% | Trust |
| Email/creative ops | 10% | Conversion support |

Rebalance when **rolling baselines** show **2×** efficiency gap for **4 weeks**.

---

## Owner

- **growth-agent:** experiment calendar and creative briefs.
- **Review:** monthly channel mix using **signup attributed** (best-effort UTM + self-reported survey optional).

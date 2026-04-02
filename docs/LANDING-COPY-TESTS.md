# DataSpark — Landing Copy Tests

Structured copy experiments for the waitlist landing page. Each section includes **KPI baselines**, **hypotheses**, **variants**, **sample size assumptions**, and **decision rules**.

## Global measurement

- **Primary:** session → waitlist signup conversion rate (**unique sessions**).
- **Guardrails:** average time on page, scroll depth to form, spam submissions.
- **Segment:** report mobile and desktop separately when **n ≥ 200/segment/week**.

**Baseline (starting assumption):** overall landing CVR **12–18%**; mobile often **−25–35% rel.** vs desktop until optimized.

---

## Test L1 — Hero headline (above the fold)

| Item | Detail |
|------|--------|
| **Hypothesis** | Interview-specific anxiety (“real interview thinking”) outperforms competitor contrast because visitors may not know StrataScratch by name. |
| **Control (A)** | “StrataScratch teaches syntax. DataSpark teaches thinking.” |
| **Variant B** | “The data science interview isn’t a SQL quiz. It’s a thinking test.” |
| **Variant C** | “Practice the scenarios bootcamps never put on the syllabus.” |
| **KPI baseline** | Expect **14–16%** CVR on control with current traffic mix; use live rolling average as soon as available. |
| **Sample size** | For **MDE = +3 pp** at **p0 ≈ 0.15**, plan **~2,000 sessions per variant** (80% power, α=0.05). If only **~600** sessions/variant, pre-register **MDE = +5 pp** or **6-week** fixed horizon. |
| **Decision rules** | **Winner:** beat control by **≥MDE** with guardrails OK for **2 consecutive weeks**. **No call:** within **±1 pp** after full n → **keep control**, archive variants, new hypothesis. **Loser:** significantly worse → **disable** variant. |

---

## Test L2 — Subheadline (clarify “who it’s for”)

| Item | Detail |
|------|--------|
| **Hypothesis** | Naming the audience (“data science students & career switchers”) increases trust and signup without diluting positioning. |
| **Control** | Short feature list: visual practice, AI tutor, interview scenarios. |
| **Variant** | One line: “Built for **data science students and career switchers** preparing for real interviews.” |
| **KPI baseline** | Subhead tests often move CVR **+0–2 pp**; smaller expected effect → larger **n**. |
| **Sample size** | Target **MDE +2 pp** → often **~3,000+** sessions/arm; if underpowered, use **Bayesian** “probability B beats A” and **directional** learning. |
| **Decision rules** | **Adopt** if **+2 pp** sustained **and** scroll-to-form **does not drop**. **Reject** if readability scores (optional survey) or time-on-page **↓ >10%**. |

---

## Test L3 — Primary CTA button

| Item | Detail |
|------|--------|
| **Hypothesis** | “Get early access” beats “Join waitlist” because it implies future product entry, not endless queue. |
| **Control** | “Join the waitlist” |
| **Variant B** | “Get early access” |
| **Variant C** | “Reserve my spot” |
| **KPI baseline** | Micro-copy often **1–3% rel.** lift; need high **n** or aggregate weeks. |
| **Sample size** | **p0 = 0.15**, **MDE +2 pp** → **~5,000** sessions/arm approximate; **combine** with headline test only if orthogonal (risk: interaction — prefer **sequential** tests). |
| **Decision rules** | **Ship** if **≥+1.5 pp** sustained **4 weeks** **and** no signup-start→complete drop. Else **keep control**. |

---

## Test L4 — Social proof block

| Item | Detail |
|------|--------|
| **Hypothesis** | Dynamic or specific counts outperform static “2000+” when updated weekly — reduces “fake social proof” skepticism. |
| **Control** | “Join **2,000+** data scientists” |
| **Variant** | “Join **{count}** learners — updated weekly” |
| **KPI baseline** | Social proof lifts vary; **0–4 pp** possible when count is credible. |
| **Sample size** | **~1,500–2,500** sessions/arm for **+3 pp** MDE at 15% baseline. |
| **Decision rules** | **Ship** if **+2 pp** min and **no** uptick in “spam” feeling (optional feedback widget). If operational burden is high, **fallback** to banded copy. |

---

## Test L5 — Risk reducer under CTA

| Item | Detail |
|------|--------|
| **Hypothesis** | “No spam · Unsubscribe anytime · We never sell your email” increases completions for privacy-sensitive cohorts (EU, career switchers). |
| **Control** | No line |
| **Variant** | Privacy microcopy under button |
| **KPI baseline** | Expect larger effect on **signup start → complete** than on session start; monitor both. |
| **Sample size** | If measuring **step-2** rate with **p0 ~ 0.75**, **MDE +3 pp** needs **~1,300** completions/arm. |
| **Decision rules** | **Ship** if completion rate **↑** with steady traffic mix. **Drop** if total CVR flat and extra text pushes form below fold badly on mobile. |

---

## Interaction & sequencing rules

1. **One headline OR one CTA** per period unless using multivariate with **4×** traffic.
2. Document **interactions:** if L1 winner + L3 winner together **underperform**, run **A×B** validation for **1 week**.
3. **Seasonality:** compare to **year-ago** only after 12 months; before that, use **4-week rolling** control.

---

## Copy bank (next iterations)

- Hooks emphasizing **metric investigation**, **A/B test literacy**, **system design** — rotate in subhead tests after core tests stabilize.

---

## Owner

- **growth-agent:** hypothesis queue and copy variants.
- **Frontend:** implement toggles / experiments.
- **Review cadence:** biweekly when traffic is low; weekly when **>10k** sessions/month.

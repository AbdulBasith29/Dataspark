# DataSpark — Funnel Metrics

Definitions, **KPI baselines**, measurement notes, and **decision rules** for funnel health. Aligns with pre-launch waitlist growth and post-launch product funnel.

## Funnel maps

### A) Acquisition → waitlist (pre-launch)

```text
Impression → View content → Profile/landing visit → Signup submit → Confirmed waitlist → Nurture open → Referral share → Referred signup
```

### B) Post-launch (product)

```text
Visit → Sign up / trial → Activation (first lesson completed) → Habit (week-1 return) → Paid conversion → Retention
```

This document emphasizes **A**; **B** uses the same discipline with different baselines (update after launch).

---

## Stage definitions

| Stage | Definition | Primary event (suggested name) |
|-------|------------|--------------------------------|
| Impression | Ad or organic view of content | `content_impression` (platform-specific) |
| Content engagement | Click, expand, 3s+ watch | `content_engagement` |
| Landing session | First page load on marketing domain | `landing_session_start` |
| Signup start | Focus or submit on email field | `signup_start` |
| Signup complete | Server accepted waitlist | `waitlist_signup` |
| Confirmed | Double opt-in if used | `email_confirmed` |
| Nurture delivered | Email sent | `email_sent` |
| Nurture opened | Open tracked | `email_open` |
| Referral share | User copied link or used share | `referral_share` |
| Referred signup | Attributed signup | `waitlist_signup_referred` |

**Attribution:** last non-direct touch within **7 days** for social; **UTM** required for paid (when enabled).

---

## KPI baselines (replace with rolling 4-week averages)

### Acquisition & landing

| KPI | Baseline | Hypothesis / target direction |
|-----|----------|--------------------------------|
| Landing session → signup | **12–18%** | Lift toward **25%+** as in marketing playbook “month 2+” |
| Signup start → complete | **70–85%** | Friction and validation errors drive spread |
| Mobile vs desktop CVR | Mobile **−20–40% rel.** | Track separately; mobile UX is a guardrail |
| Source: Organic TikTok/Reels | **0.8–3%** session-to-signup (variance high) | Improve with CTA clarity and landing match |
| Source: LinkedIn | **2–6%** | Often highest intent; optimize LinkedIn-specific LP |

### Email lifecycle

| KPI | Baseline | Notes |
|-----|----------|--------|
| Welcome email open | **45–55%** | Subject line tests; deliverability |
| Day-3 nurture open | **25–35%** | Value headline matters |
| Click to landing from email | **3–8%** | Low is OK if opens are healthy |
| Unsubscribe (first 30 days) | **<0.5%** per email | Spikes → content misfire |

### Referral loop

| KPI | Baseline | Notes |
|-----|----------|--------|
| Signups sharing within 7 days | **5–12%** | Depends on incentive clarity |
| Viral coefficient *k* (simplified) | **0.05–0.15** | `invites × conversion`; track as sanity check |

---

## Derived metrics

| Metric | Formula | Use |
|--------|---------|-----|
| **Cost per waitlist signup** | Spend / signups | $0 organic initially; still track time cost |
| **Signup velocity** | Signups / week | Board-level trajectory vs 5k goal |
| **Email list health** | Opens × clicks | Early warning for fatigue |
| **Referral attach rate** | Referred signups / all signups | Loop strength |

---

## Hypotheses (funnel-level)

1. **H1:** The largest leak is **landing → signup**, not email opens — fixing hero and mobile form yields more total signups than sending more emails.
2. **H2:** **LinkedIn** sessions have fewer impressions but higher signup rate — budget time proportionally to **conversion**, not vanity reach.
3. **H3:** Referral **k** stays sub-viral until incentive + one-click share are obvious at **moment of peak excitement** (post-signup).

---

## Sample size & monitoring assumptions

- **Weekly review** with **minimum sample**: do not conclude on **<200 landing sessions** per segment unless effect is huge (e.g., **2×** CVR).
- **Segmentation** (mobile/desktop, source) requires **multiples of that n** per cell; default to **global** metrics until volume allows.
- **Anomaly detection:** flag **±3σ** week-over-week on signup velocity with **cause** (viral post, outage, form bug).

---

## Decision rules

| Signal | Rule |
|--------|------|
| Signup CVR drops **>20% rel.** for **1 week** | Incident mode: check form, analytics, page speed, broken links |
| Open rate drops **>10 pp abs.** vs 4-wk avg | Pause new emails; test subject; verify domain auth |
| Referral shares ↑ but referred signups flat | Broken attribution or unclear landing — fix tracking before creative tests |
| Any stage improves **≥ pre-registered MDE** for **2 weeks** | Document win; ship broadly; update baselines in this file |

---

## Dashboard checklist (minimum viable)

- [ ] Daily: signups, sessions, CVR, top UTM sources
- [ ] Weekly: per-channel rollup, mobile/desktop, email funnel
- [ ] Monthly: cohort of week-0 signups → referral behavior by week 4

---

## Owner & refresh

- **Owner:** growth-agent + whoever owns analytics implementation.
- **Refresh baselines:** every **4 weeks** or after any major product/landing change.

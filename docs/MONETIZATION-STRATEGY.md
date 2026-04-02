# DataSpark — Monetization Strategy

## Purpose

Define how DataSpark captures value from interview-focused data science learning (curriculum, practice, visualizations, topic-scoped AI tutor) without undermining acquisition or trust.

## Strategic pillars

1. **Land with learning value** — Free tier must feel complete for light users and credible for word-of-mouth.
2. **Monetize depth and velocity** — Paid tiers unlock volume (questions, courses), tutor usage, and workflow features (history, teams).
3. **Protect unit economics** — AI tutor and heavy compute are gated; static content scales cheaply.
4. **Experiment in public** — Pricing and packaging change via staged rollouts with pre-defined guardrails (see `REVENUE-EXPERIMENTS.md`).

## Target segments

| Segment | Job to be done | Primary offer |
|--------|----------------|---------------|
| **Student / career switcher** | Structured path + practice | Pro (annual) |
| **Working analyst / DS** | Targeted refresh + mock depth | Pro or Team |
| **Bootcamp / study group** | Shared progress + accountability | Team |
| **Hiring / L&D (future)** | Cohorts and reporting | Team+ or separate B2B contract |

## Revenue model (primary)

- **Subscription** (monthly and annual) for individuals and small teams.
- **Optional add-ons** (later): certification attempts, 1:1 mock blocks, API/export — only after core subscription is stable.

## Positioning vs. alternatives

- **Vs. generic courses** — Interview rubrics, question bank density, and topic-locked tutor.
- **Vs. LeetCode-style** — Data/ML/system design in one product with visual intuition layer.
- **Vs. books / videos** — Active practice + feedback loops (rubric, hints, tutor).

## Tiering summary

| Tier | Role in funnel | Economic role |
|------|----------------|----------------|
| **Free** | Acquisition, habit formation | Lead gen; COGS mainly infra + light tutor cap |
| **Pro** | Core revenue | Highest LTV/CAC target segment |
| **Team** | Expansion + higher ACV | Per-seat ARPA; admin value |

Details: `PACKAGING-MATRIX.md`.

## Pricing philosophy

- **Annual default in UI** — Monthly visible; annual pre-selected with honest savings copy.
- **No surprise limits** — Usage meters (tutor messages, premium questions) visible before hard blocks.
- **Grandfathering policy** — Existing subscribers keep plan terms until renewal or explicit migration; document exceptions in changelog.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Tutor cost blowout | Hard caps, model routing, caching, tier limits (`PAYWALL-TRIGGER-SPEC.md`) |
| Free tier too good | Gate depth (courses/questions per day) not core lesson quality |
| Price too low | Run structured tests; anchor with Team (`PRICING-HYPOTHESES.md`) |
| Trust / “paywall spam” | Soft gates first, single primary CTA per session |

## Rollout alignment

Monetization ships in **stages** coordinated with product readiness (see `REVENUE-EXPERIMENTS.md`): instrument → soft limits → paywall UI → price tests → team billing.

## Related documents

- `PACKAGING-MATRIX.md` — Feature/tier matrix  
- `PRICING-HYPOTHESES.md` — Testable price assumptions  
- `PAYWALL-TRIGGER-SPEC.md` — When limits trigger  
- `REVENUE-EXPERIMENTS.md` — Metrics, guardrails, experiment backlog  

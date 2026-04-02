# DataSpark — Paywall Trigger Specification

## Purpose

Define **when** paywalls and limit surfaces appear, **what** the user sees, and **how** events are named for analytics. Prevents ad-hoc gating and inconsistent copy.

## Principles

1. **Trigger after demonstrated value** — e.g. completed lesson, N questions attempted, or tutor thread started (configurable).
2. **Soft → hard** — Warning state before block; never silent failure.
3. **One primary CTA** — Upgrade vs. dismiss; secondary link to pricing/learn more.
4. **Idempotent events** — Same session should not spam identical paywall impressions (cooldown).

## Trigger catalog

| ID | Name | Condition (logical) | Tier affected | Type | Cooldown |
|----|------|------------------------|---------------|------|----------|
| T1 | `question_daily_limit` | `questions_today >= free_daily_cap` | Free | hard | 24h rolling or calendar day |
| T2 | `question_bank_gate` | User opens locked question not in free set | Free | hard | per question |
| T3 | `model_answer_gate` | User taps “full rubric/model answer” on locked item | Free | soft→hard | once per item |
| T4 | `tutor_daily_limit` | `tutor_messages_today >= cap` | Free | hard | 24h |
| T5 | `tutor_course_gate` | Tutor opened for non-unlocked course | Free | hard | per session |
| T6 | `export_gate` | Export PDF/notes | Free | hard | per action |
| T7 | `team_feature_gate` | Admin/collab route accessed | Free/Pro | hard | per session |

## UI specification (blocks)

### Modal — default

- **Title:** Short outcome (“Unlock full practice” / “Continue with your AI tutor”).
- **Body:** One sentence on **what they hit** + **what Pro unlocks** (from `PACKAGING-MATRIX.md`).
- **Primary button:** `Upgrade to Pro` → checkout or pricing with plan preselected.
- **Secondary:** `Not now` (dismiss).
- **Tertiary (text):** `See all plans` on pricing page.

### Inline — preferred for soft gates

- Banner under the blocked control; does not block entire page.
- Use for T3 before full block (e.g. show rubric preview blur).

### Toast — optional

- Only for **approaching** limits (80% tutor messages), not for hard blocks.

## Server vs. client truth

- **Authoritative limits** enforced server-side (API / edge) for tutor and question submission.
- Client may **predict** limits for UX; server response drives final error state (`402` / `403` + machine-readable code).

### Suggested error codes

| Code | Meaning | User message |
|------|---------|--------------|
| `LIMIT_QUESTIONS_DAILY` | Daily cap | Daily limit reached; upgrade or return tomorrow |
| `LIMIT_TUTOR_DAILY` | Tutor cap | Tutor limit reached; upgrade for more |
| `ENTITLEMENT_QUESTION` | Wrong tier for content | This question is part of Pro |
| `ENTITLEMENT_TEAM` | Team-only | Available on Team plan |

## Analytics events (naming)

Prefix: `paywall_`

| Event | Properties |
|-------|------------|
| `paywall_impression` | `trigger_id`, `surface`, `plan_hint`, `ab_variant` |
| `paywall_cta_click` | `trigger_id`, `cta` (`upgrade` / `pricing` / `dismiss`) |
| `paywall_dismiss` | `trigger_id`, `method` |
| `limit_warning` | `trigger_id`, `percent_used` |

## Copy guardrails

- No dark patterns (fake countdown, hidden subscriptions).
- **Refund window** and **how to cancel** linked from checkout and account.

## Rollout

- **Stage A:** Instrument only (`paywall_impression` with `shadow: true` if needed).
- **Stage B:** Soft gates (T3 inline) without blocking core navigation.
- **Stage C:** Hard gates for T1–T5 per `REVENUE-EXPERIMENTS.md`.

## Related

- `PACKAGING-MATRIX.md` — entitlements  
- `REVENUE-EXPERIMENTS.md` — staged enablement and success metrics  

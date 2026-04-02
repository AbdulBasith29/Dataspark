# DataSpark — Packaging Matrix

## Purpose

Single reference for **what each tier includes**. Engineering, support, and marketing should align on these gates. Numeric limits are **defaults for design**; tune via experiments (`REVENUE-EXPERIMENTS.md`).

## Tiers at a glance

| Capability | Free | Pro | Team |
|------------|:----:|:---:|:----:|
| **Courses — browse & sample lessons** | ✓ | ✓ | ✓ |
| **Practice questions — total accessible** | Limited subset | Full bank | Full bank |
| **Questions per day (soft)** | 5–10 | Unlimited* | Unlimited* |
| **Visualizations (embedded)** | All in free lessons | All | All |
| **AI tutor — messages / day** | 10–20 | 200–500 | Pooled per team |
| **AI tutor — courses unlocked** | 1–2 topics | All enrolled | All enrolled |
| **Model answers & rubric** | Delayed or partial | Full | Full |
| **Progress sync / account** | Basic | Full | Full |
| **Bookmarks / collections** | — | ✓ | ✓ |
| **Mock interview mode / timers** | Limited | Full | Full |
| **Exports (notes, PDF)** | — | ✓ | ✓ |
| **Admin & seat management** | — | — | ✓ |
| **Shared team progress (future)** | — | — | ✓ |

\*Fair use: abuse protection still applies (rate limits, automation detection).

## Dimension definitions

### Question access

- **Free:** Rotating or first-N per course + difficulty mix fixed by product (not “random paywall”).
- **Pro/Team:** Full catalog; filters (tags, difficulty, company-style scenarios) fully enabled.

### AI tutor

- **Free:** Strict topic scope + low daily cap; no long context uploads if/when added.
- **Pro:** Higher cap; optional priority model tier internally (not marketed until stable).
- **Team:** **Pooled** monthly tutor quota across seats; optional per-seat overrides for admins.

### Identity and collaboration

- **Team** requires verified domain or invite flow; billing owner can reassign seats.

## Packaging principles

1. **Never paywall basic readability** of a lesson the user already opened (avoid rage quits).
2. **Prefer daily soft limits** on Free for habit building vs. hard “3 questions ever.”
3. **One clear upgrade path** per surface (see `PAYWALL-TRIGGER-SPEC.md`).

## Versioning

Bump matrix version when limits change.

| Version | Date | Summary |
|---------|------|---------|
| 0.1 | 2026-04-02 | Initial matrix for DataSpark MVP |

# Python Course Recovery Program — Parallel Agent Execution Plan

## Objective
Fix all identified Python-course inconsistencies and UX reliability defects using parallel workstreams with clear ownership, disjoint write scopes, and measurable outcomes.

## Program Cadence
- **Phase 1 (Days 1–3):** Platform trust + architecture normalization (P0)
- **Phase 2 (Days 4–7):** Curriculum and pedagogy upgrades (P1)
- **Phase 3 (Days 8–10):** Instrumentation, monetization hooks, release hardening (P2)

## Workstream-to-Agent Matrix

| Agent | Workstream | Priority | Ownership Scope (write set) | Key Deliverables |
|---|---|---:|---|---|
| A | UX Accessibility Core | P0 | `src/components/**`, `src/pages/**`, `src/app/**` interaction surfaces | Semantic controls, focus-visible parity, keyboard support, aria-live status regions |
| B | Async State Protocol | P0 | CTA/action components and form flows | Unified `idle→pending→success/error` states, duplicate-submit guards |
| C | Design Tokens & UI Cohesion | P0 | `src/lib/ds-platform-tokens.js`, shared styling usage | Cross-surface token normalization (landing + platform) |
| D | Lesson Schema Unification | P0 | `src/data/lesson-modules.js` schema sections | Single canonical lesson contract, eliminate contradictory fallback behavior |
| E | Metadata Integrity Guardrails | P0 | `src/data/lesson-modules.js`, `src/app/dataspark-full-platform.jsx` | Resolve duration/video/hasViz conflicts, add consistency assertions |
| F | OOP Cluster Rewrite | P1 | `src/data/lesson-modules.js` (`py-o1..py-o4`) | Replace templated thin content with full-depth modules |
| G | Python Data Visual Alignment | P1 | `src/app/dataspark-full-platform.jsx`, `src/visualizations/**` (if needed) | Remap/re-skin `py-d1..py-d5` visuals for semantic fit |
| H | Assessment Upgrade | P1 | `src/data/lesson-modules.js`, eval paths | Add free-response + rubric hooks, normalize check rigor |
| I | Tutor Orchestration | P1 | `src/chatbot/**`, lesson prompt hooks | Pre-Try, post-fail, weekly recap tutor flows |
| J | Analytics + LVS | P2 | `src/lib/analytics.js`, docs metrics specs | Learning Value Score instrumentation and dashboard event contract |

## Dependency Graph

### Immediate Parallel Starts (no blockers)
- A, B, C, D, F, G, H, I, J can start Day 1.

### Soft Dependencies
- E depends on D’s schema finalization for permanent guards.
- H and I depend on D’s lesson contract naming to wire deterministic hooks.
- J depends on A/B/H/I event naming stabilization before final dashboard spec freeze.

## Ticket Backlog (Execution-Ready)

### P0 — Revenue/Trust Blockers

#### DS-P0-001 Semantic Interaction Contract
- **Owner:** Agent A
- **Scope:** Replace non-semantic clickable containers with proper buttons/links where applicable.
- **Acceptance Criteria:**
  - All primary navigation cards and CTAs keyboard operable.
  - Focus ring visible and consistent.
  - No `div`-only interactive anti-patterns on primary flows.

#### DS-P0-002 Global Async Action States
- **Owner:** Agent B
- **Scope:** Standardize action lifecycle states for forms/buttons.
- **Acceptance Criteria:**
  - Pending state on all primary async actions.
  - Duplicate submissions prevented.
  - Success/error states include actionable recovery path.

#### DS-P0-003 Token Cohesion Baseline
- **Owner:** Agent C
- **Scope:** Normalize spacing/radii/focus tokens across landing and product surfaces.
- **Acceptance Criteria:**
  - Shared token values applied to top funnel pages and lesson shell.
  - Visual diffs show consistent interaction styling.

#### DS-P0-004 Lesson Contract Unification
- **Owner:** Agent D
- **Scope:** Canonicalize lesson module structure and remove contradictory fallback copy paths.
- **Acceptance Criteria:**
  - One deterministic module contract for Python lessons.
  - No copy references to unavailable media.

#### DS-P0-005 Metadata Integrity Fixes
- **Owner:** Agent E
- **Scope:** Eliminate `hasViz`, duration, and video-path contradictions.
- **Acceptance Criteria:**
  - `py-o3` / `py-d4` metadata aligned with runtime behavior.
  - Duration source-of-truth is singular.
  - Validation checks fail build on future conflicts.

### P1 — Curriculum/Experience Quality

#### DS-P1-101 OOP Full Rewrite (py-o1..py-o4)
- **Owner:** Agent F
- **Scope:** Replace thin template content with deep modules including anti-pattern drills.
- **Acceptance Criteria:**
  - Each lesson has concrete failure-mode examples.
  - Each lesson includes at least one production-style scenario prompt.

#### DS-P1-102 Python Data Visual Remap
- **Owner:** Agent G
- **Scope:** Align `py-d1..py-d5` visuals with lesson semantics.
- **Acceptance Criteria:**
  - No clearly cross-domain-misaligned visual names/frames for Python data lessons.
  - Try guidance references actual visual behavior.

#### DS-P1-103 Assessment Rigor Normalization
- **Owner:** Agent H
- **Scope:** Standardize checks and add short free-response rubric prompt per lesson.
- **Acceptance Criteria:**
  - Minimum check floor applied across all Python lessons.
  - Rubric fields available for evaluation path.

#### DS-P1-104 Tutor Embedded Recovery Loops
- **Owner:** Agent I
- **Scope:** Add deterministic tutor prompts at pre-Try, post-fail, weekly recap.
- **Acceptance Criteria:**
  - Trigger events fire with lesson context payload.
  - Tutor prompt templates exist for all Python clusters.

### P2 — Measurement + Monetization Readiness

#### DS-P2-201 Learning Value Score (LVS)
- **Owner:** Agent J
- **Scope:** Instrument starts, completions, pass rates, confidence deltas, revisit, tutor recovery.
- **Acceptance Criteria:**
  - Event schema documented and emitted.
  - Dashboard spec includes per-lesson prioritization score.

#### DS-P2-202 Progress Artifact Packaging
- **Owner:** Agent J (with F/H support)
- **Scope:** Skills-unlocked and milestone outputs for learner-facing ROI.
- **Acceptance Criteria:**
  - At least one artifact surface per Python module cluster.

## Branching + Merge Strategy
- Create feature branches per agent workstream.
- Rebase against integration branch daily.
- Merge order:
  1. D (schema)
  2. E (integrity checks)
  3. A/B/C (UX reliability)
  4. F/G/H/I (curriculum and tutor)
  5. J (analytics)

## Quality Gates (Blocking)
1. **Metadata gate:** no `hasViz`/video/duration contradictions.
2. **Accessibility gate:** semantic controls + focus-visible + keyboard support on primary flows.
3. **Pedagogy gate:** lesson depth and scenario realism thresholds met.
4. **Assessment gate:** MCQ + free-response rubric coverage.
5. **Instrumentation gate:** LVS events emitted and validated.

## Integration Review Checklist
- [ ] Python lesson ordering and IDs are stable and complete.
- [ ] No learner-facing placeholder/system-status copy.
- [ ] All referenced visuals/videos are available through the selected contract path.
- [ ] UX conversion surfaces pass keyboard + screen-reader smoke checks.
- [ ] Event analytics match taxonomy docs.

## Rollout Plan
- **Stage 1:** Internal QA + dogfood.
- **Stage 2:** 20% rollout to new users.
- **Stage 3:** 100% rollout with LVS monitoring.

## Success Metrics
- Higher first-session completion and reduced drop-off.
- Increased lesson→practice continuation.
- Improved D7 retention and tutor-assisted recovery.
- Fewer curriculum inconsistency bug reports.

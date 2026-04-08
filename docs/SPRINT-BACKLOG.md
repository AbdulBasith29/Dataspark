# DataSpark — Sprint Backlog

**Owner:** Product / ops  
**Sources:** `docs/AGENT-TASKS.md`, `docs/ARCHITECTURE.md`, repo state (landing + Supabase waitlist)  
**Last updated:** 2026-04-04

---

## Prioritization dimensions

Each backlog item is scored **1–5** on five dimensions (higher is better **except** Effort and Delivery risk, where higher means *more* cost or uncertainty).

| Dimension | Question we answer |
|-----------|---------------------|
| **Impact** | Does this materially improve learning outcomes, interview readiness, or perceived product quality? |
| **Revenue** | Does this drive waitlist signups, conversion, retention, or future paid willingness? |
| **Strategic fit** | Does this reinforce the three pillars (Learn / Practice / AI Tutor) and the “visual + context + scoped AI” differentiation? |
| **Effort** | Engineering + content + design cost (1 = small, 5 = very large). |
| **Delivery risk** | Dependencies, unknowns, integration fragility, or quality risk (1 = low, 5 = high). |

**Net priority (qualitative):** Items with high **Impact + Revenue + Fit** and lower **Effort + Risk** are pulled first. Exact ordering is a judgment call; scores make tradeoffs explicit.

**Priority tiers:** **P0** (must ship for credible MVP), **P1** (strong follow-on), **P2** (scale and depth).

---

## Global Definition of Ready (DoR)

An item may enter a sprint when **all** apply:

1. **Problem and outcome** are stated in one paragraph (who benefits, what changes).
2. **Acceptance criteria** exist in `docs/ACCEPTANCE-CRITERIA.md` (linked by backlog ID).
3. **Dependencies** are named (e.g. question schema fixed, course IDs stable).
4. **Owner** is assigned (curriculum / viz / frontend / chatbot / integration / ops).
5. **Size** is agreed (S / M / L / XL) relative to team throughput.
6. **No blocking open questions** on scope (time-boxed spikes are separate backlog items).

---

## Global Definition of Done (DoD)

An item is **done** when **all** apply:

1. All acceptance criteria for that item are **met** (or explicitly waived in `docs/DECISION-LOG.md`).
2. **No regressions** on the review checklist applicable to that surface (see `docs/AGENT-TASKS.md` — Integration & Code Review).
3. **Observable quality:** no console errors on happy path; dark theme and typography consistent where UI is touched.
4. **Traceability:** meaningful commit(s) or PR description references the backlog ID (e.g. `PO-014`).
5. If user-visible: **smoke-tested** on desktop and one mobile width.

---

## Backlog items

### Legend — per-item Ready / Done

- **Ready:** extra item-specific gates beyond global DoR (if none, “satisfies global DoR”).
- **Done:** extra item-specific gates beyond global DoD (if none, “satisfies global DoD + AC”).

---

### P0 — MVP credibility

| ID | Theme | Item | I | R | Fit | Effort | Risk | Tier | Ready | Done |
|----|--------|------|---|---|-----|--------|------|------|--------|------|
| PO-001 | Curriculum | **Minimum viable question banks** — At least one course at full target count; remaining courses at ≥50% of target with even Easy/Medium/Hard mix per `AGENT-TASKS`. | 5 | 4 | 5 | 5 | 3 | P0 | Question JSON schema locked; sample audited for rubric/hints/tags. | Spot-check N questions per course against spec; export/build passes. |
| PO-002 | Visualization | **Core viz pack (Phase 1 total: 10)** — Per `EXECUTION ORDER` Phase 1, ship **ten** priority visualizations total. Three are already done (`NormalDistribution`, `GradientDescent`, `BiasVariance`); build the **remaining seven** from the Dept 2 list (starting with `LinearRegression.jsx` through the next items until seven net-new components ship). | 5 | 5 | 5 | 4 | 3 | P0 | Component shell pattern agreed; canvas perf target defined. | Each viz: interactivity + smooth animation + labels; embedded in at least one lesson or demo flow. |
| PO-003 | Frontend | **Learn + Practice shell** — `HomePage`, `CoursePage`, `LessonPage`, `QuestionPage`, `Navigation`, shared `ProgressBar` / `QuestionCard` / `DifficultyBadge` / `SearchFilter` / `Timer` per `AGENT-TASKS`. | 5 | 4 | 5 | 5 | 4 | P0 | Course metadata and routing/navigation approach agreed (router vs state per existing rules). | End-to-end path: pick course → open lesson → open question → filter/search works. |
| PO-004 | Chatbot | **Tutor MVP** — `system-prompts.js` + `chatbot-config.js` for all 9 courses; `AIChatbot.jsx` wired to course scope with off-topic handling. | 4 | 3 | 5 | 3 | 4 | P0 | API/key strategy and rate limits understood. | Manual test: each course tutor stays on-topic; markdown/code formatting OK. |
| PO-005 | Integration | **Integrated artifact** — Single shipped experience (e.g. `dataspark-mvp.jsx` or merged app) passes department review checklist in `AGENT-TASKS`. | 5 | 5 | 5 | 4 | 4 | P0 | All P0 streams have a merge candidate branch. | Full checklist green; demo recorded or script documented. |
| PO-006 | GTM / Ops | **Waitlist path health** — Landing → signup → thank-you; Supabase capture + error handling; basic analytics events if instrumented in repo. | 4 | 5 | 4 | 2 | 2 | P0 | Env vars and migration applied in target environment. | Test signup succeeds; failure modes graceful; events visible or documented as N/A. |

---

### P1 — Depth and conversion

| ID | Theme | Item | I | R | Fit | Effort | Risk | Tier | Ready | Done |
|----|--------|------|---|---|-----|--------|------|------|--------|------|
| PO-007 | Curriculum | **Full question targets** — All courses hit 25–40+ counts per `ARCHITECTURE` / `AGENT-TASKS`. | 5 | 4 | 5 | 5 | 2 | P1 | PO-001 complete. | Coverage report by course; difficulty distribution verified. |
| PO-008 | Visualization | **Remaining viz library** — Build out the rest of the viz list in `AGENT-TASKS` after the core pack. | 4 | 4 | 5 | 5 | 3 | P1 | PO-002 complete; ordering frozen for next batch. | Same Done bar as PO-002 per component. |
| PO-009 | Frontend | **Progress persistence** — Progress structure in `AGENT-TASKS` backed by durable storage (account or device), not only React state. | 4 | 4 | 4 | 3 | 3 | P1 | Auth or anonymous ID approach decided. | Refresh / new session restores progress; migration plan for schema changes. |
| PO-010 | Chatbot | **Tutor polish** — Latency UX, empty states, error retries, streaming if applicable. | 3 | 3 | 4 | 2 | 2 | P1 | PO-004 live. | UX review on slow/failed responses. |
| PO-011 | Product | **Progression gates (level-gated)** — Implement or align with `PROGRESSION-SYSTEM.md` module quizzes and locks where product chooses. | 4 | 3 | 5 | 4 | 4 | P1 | Pedagogy rules approved (pass thresholds, retakes). | Gating works without dead-ends; copy explains why locked. |

---

### P2 — Scale and moat

| ID | Theme | Item | I | R | Fit | Effort | Risk | Tier | Ready | Done |
|----|--------|------|---|---|-----|--------|------|------|--------|------|
| PO-012 | Curriculum | **Content QA pipeline** — Systematic audits for model answers, rubrics, and “common mistakes” fields. | 3 | 2 | 4 | 3 | 2 | P2 | Sampling checklist exists. | Audit log or spreadsheet linked in decision log once per quarter. |
| PO-013 | Marketing | **Clip-ready demos** — Short screen recordings per `MARKETING-PLAYBOOK` using real product visuals. | 2 | 5 | 3 | 2 | 1 | P2 | PO-002/PO-008 partial. | Published clips with CTA to waitlist. |
| PO-014 | Platform | **Code runner for Python/SQL** (if in roadmap) — In-browser execution for practice, per `PROGRESSION-SYSTEM` layer 3. | 4 | 3 | 4 | 5 | 5 | P2 | Security model approved (sandbox, limits). | Abuse tested; cost ceiling defined. |

---

## Suggested sprint sequence (not fixed)

1. **Sprint A — Foundation:** PO-006, PO-001 (parallel streams), PO-002 (start).
2. **Sprint B — Experience:** PO-003, PO-002 (finish), PO-004 (start).
3. **Sprint C — Integration:** PO-004 (finish), PO-005.
4. **Sprint D+ — P1/P2:** PO-007 through PO-014 as capacity allows.

Re-sequence when **Delivery risk** or dependencies change; record changes in `docs/DECISION-LOG.md`.

---

## Notes

- **Current repo:** `src/App.jsx` includes `/platform` (full `DataSparkPlatform`) and marketing routes. **PO-005** now means merging polish, data extraction (`src/data/`), and review sign-off—not basic routing.
- **IDs** are stable: new work gets new `PO-###` IDs; do not renumber retired items (mark **Cancelled** in the decision log instead).

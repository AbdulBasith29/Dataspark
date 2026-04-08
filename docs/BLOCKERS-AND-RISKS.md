# DataSpark — Blockers & Risks

**As-of:** 2026-04-04

---

## Active blockers

| ID | Severity | Description | Owner | Mitigation |
|----|----------|-------------|--------|------------|
| B-DEPLOY-001 | Medium | Production/staging not verified with `ANTHROPIC_API_KEY` and live `/api/ai/*` on the host (e.g. Vercel). | product-ops + frontend-agent | Deploy preview; hit `/api/ai/chat` and `/api/ai/evaluate`; document URL + env in runbook. |
| B-CURR-001 | Medium | Practice questions and rubrics are embedded in `dataspark-full-platform.jsx`, not the structured `src/data/questions-*` files from `AGENT-TASKS`. | curriculum-agent | Extract schema-aligned JSON; platform imports banks by `course.id`. |

---

## Risks (non-blocking)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-STACK-001 | Stack drift: orchestrator rule still mentions Next.js; repo is Vite + React Router | Med | Low | Prefer `EXECUTION-PLAN.md` + this file; update rule in a dedicated docs pass. |
| R-EVENTS-001 | Analytics `event_logs` insert-only RLS | Med | Med | Instrumentation focuses on stable `event_name` writes. |
| R-MVP-001 | Full curriculum size vs sprint | High | High | MVP = renderable subset + honest copy; scale in Phase 3+. |
| R-E2E-001 | No Playwright in `package.json` | Med | Med | Manual smoke matrix for Phase 2; automate later. |
| R-EVAL-001 | Derived rubric is generic until per-question rubrics land | Med | Med | Ship curated rubric arrays per question with PO-001. |

---

## Resolved (recent)

| Item | Resolution |
|------|------------|
| B-PLAT-001 | `/platform` routed; `/dashboard` redirects. |
| B-AI-SEC-001 | No browser Anthropic key path for chat; server handlers + dev middleware. |
| B-VID-001 | `src/visualizations/` exists with multiple components + tabular SQL joins spec. |
| Practice AI eval | Submit calls `/api/ai/evaluate`; scorecard renders (fallback when key missing per API). |

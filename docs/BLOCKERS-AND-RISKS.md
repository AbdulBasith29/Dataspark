# DataSpark — Blockers & Risks

**As-of:** 2026-04-03

---

## Active blockers

| ID | Severity | Description | Owner | Mitigation |
|----|----------|-------------|--------|------------|
| B-PLAT-001 | High | Platform experience is not routed into `src/App.jsx` yet (only marketing + preview). | frontend-agent | Frontend adds `/platform` route and renders platform MVP pages. Also add compatibility redirect `/dashboard` -> `/platform`. |
| B-AI-SEC-001 | High | Tutor/evaluation is not secure: current code may call Anthropic directly in the browser. | chatbot-agent + frontend-agent | Move all Anthropic traffic behind secure server endpoints. Frontend must call only your secure endpoints (no browser API secrets). |
| B-VID-001 | Medium | No `src/visualizations/` folder/components currently exist; lessons in prototypes reference embedded viz. | viz-agent | Extract/create a minimal set of visualization components for the top lessons. |

---

## Risks (non-blocking)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-STACK-001 | Stack drift: orchestration rule examples are Next.js, repo is Vite + React Router | Med | Med | Document Vite assumptions in `EXECUTION-PLAN.md` and keep endpoints Vite-compatible. |
| R-EVENTS-001 | Analytics table `event_logs` has insert-only RLS; no client reads | Med | Med | Data instrumentation focuses on stable `event_name` writes; dashboard queries stay server-side. |
| R-MVP-001 | Curriculum may be large (25–40+ per course) for a 2-week sprint | High | High | Phase 0–2 targets MVP quantities (renderable subset) and defers scale to Phase 3+. |
| R-E2E-001 | No automated E2E tooling in `package.json` | Med | Med | QA uses a manual smoke matrix for Phase 2; propose Playwright in Phase 3+. |

---

## Resolved (this session)

| Item | Resolution |
|------|------------|
| Local baseline | `npm run build` + `npm run lint` are green before Phase 0 agent changes |


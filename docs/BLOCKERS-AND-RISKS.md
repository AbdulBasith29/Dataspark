# DataSpark — Blockers & Risks

**As-of:** 2026-04-02

---

## Active blockers

| ID | Severity | Description | Owner | Mitigation |
|----|----------|-------------|--------|------------|
| B-002 | Medium | Staging URL not deployed / not verified in this session | product-ops | Deploy Vite build; set env; run P1-PO |
| B-003 | Medium | No automated E2E in `package.json` | qa-test | Manual smoke for Phase 2; add Playwright/Cypress in Phase 3+ |

---

## Risks (non-blocking)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-001 | Stack drift: orchestrator rule describes Next.js; repo is Vite + React | Med | High | Document in runbook; align future migration |
| R-002 | `event_logs` / waitlist RLS is insert-only for anon; analytics queries need service role or backend | Med | Med | data-instrumentation: document server-side access |
| R-003 | Revenue scope creep before product-market fit | Med | Med | revenue-agent: explicit phase gates (see P0-REV) |

---

## Resolved (this session)

| Item | Resolution |
|------|------------|
| B-001 Canonical agent specs | Added `docs/ORCHESTRATOR-AGENT.md`, `PRODUCT-OPS-AGENT.md`, `GROWTH-AGENT.md`, `QA-TEST-AGENT.md`, `DATA-INSTRUMENTATION-AGENT.md`, `REVENUE-AGENT.md` |
| Local build | `npm run build` passes |
| Lint | `npm run lint` passes |

---

## Escalation

- **Staging NO_GO:** escalate to product-ops + orchestrator if deadline within 7 days.  
- **Production:** no escalation until Phase 2 **GO_STAGING** and Phase 3 program scope defined.

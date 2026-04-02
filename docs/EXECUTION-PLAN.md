# DataSpark — Startup Execution Plan (Orchestrator)

**Version:** 1.0  
**As-of:** 2026-04-02  
**Scope:** End-to-end startup operations across product-ops, growth, QA, data instrumentation, and revenue.  
**Source alignment:** `.cursor/rules/orchestrator.md`, `docs/ARCHITECTURE.md`, `docs/AGENT-TASKS.md`, `docs/MARKETING-PLAYBOOK.md`.  
**Note:** Canonical agent specs live under `docs/*-AGENT.md` (orchestrator, product-ops, growth, qa-test, data-instrumentation, revenue). Stack details follow **`package.json`**; `.cursor/rules/orchestrator.md` may describe a future Next.js layout.

---

## Phase map (startup operations)

| Phase | Name | Goal |
|-------|------|------|
| **0** | Bootstrap & alignment | Single source of truth, env/secrets, DB/migration alignment, baseline quality gates |
| **1** | Parallel workstreams | Each agent executes scoped tasks with documented handoffs |
| **2** | Staging & integration | Staging deploy, smoke/E2E, gate review, interim GO/NO-GO |
| **3+** | Full program | Curriculum scale, viz backlog, platform expansion (see `AGENT-TASKS.md`), production cutover |

This document **executes Phase 0–2 planning and dispatch**; Phases 3+ are deferred until Phase 2 gates pass.

---

## Gate checks (enforce before any task = done)

1. **G0 — Build:** `npm run build` exits 0.  
2. **G1 — Lint:** `npm run lint` exits 0.  
3. **G2 — Secrets:** No service keys in client bundles; `.env.example` lists required vars only.  
4. **G3 — Data:** Supabase migration applied on target project; RLS policies match app expectations.  
5. **G4 — Smoke:** Waitlist insert + at least one `event_logs` insert succeed in staging (or documented skip with reason).  
6. **G5 — Docs:** Agent deliverable file exists under `docs/agents/<agent>/` with acceptance criteria ticked.

---

## Task packets — Phase 0

### P0-ORCH — Orchestrator bootstrap

| Field | Value |
|-------|--------|
| **task_id** | `P0-ORCH` |
| **owner_agent** | orchestrator-agent |
| **objective** | Establish execution artifacts, DAG, and agent dispatch; resolve doc gaps. |
| **scope** | Create `EXECUTION-PLAN.md`, `DEPENDENCY-GRAPH.md`, `DAILY-STATUS.md`, `BLOCKERS-AND-RISKS.md`; stub agent deliverables. |
| **dependencies** | None |
| **acceptance_criteria** | Four docs exist; Phase 0–2 packets defined; missing upstream agent specs logged in blockers. |
| **quality_checks** | Links valid; dates consistent (2026); no duplicate conflicting phase definitions. |
| **deadline** | T+0 (planning sprint) |
| **handoff_artifacts** | This file; `DEPENDENCY-GRAPH.md`; `BLOCKERS-AND-RISKS.md` |
| **risk_notes** | Specs absent; role assumptions may need revision when canonical docs land. |

---

### P0-PO — Product & ops alignment

| Field | Value |
|-------|--------|
| **task_id** | `P0-PO` |
| **owner_agent** | product-ops-agent |
| **objective** | Define launch scope, RACI, and ops runbook skeleton for Phase 0–2. |
| **scope** | Review `ARCHITECTURE.md`, `TECH-STACK.md`; own `docs/agents/product-ops/PHASE-0-2.md`. |
| **dependencies** | `P0-ORCH` (orchestrator artifacts published) |
| **acceptance_criteria** | Runbook lists owners, env vars, rollback for staging; legal/privacy placeholders cross-linked. |
| **quality_checks** | G5; stakeholder list non-empty. |
| **deadline** | T+2 |
| **handoff_artifacts** | `docs/agents/product-ops/PHASE-0-2.md` |
| **risk_notes** | Vite SPA vs Next.js in orchestrator rule — document actual stack in runbook. |

---

### P0-GW — Growth baseline

| Field | Value |
|-------|--------|
| **task_id** | `P0-GW` |
| **owner_agent** | growth-agent |
| **objective** | Align waitlist funnel copy and channels with `MARKETING-PLAYBOOK.md`. |
| **scope** | Audit `src/app/landing-page.jsx`, `ThankYouPage`; own `docs/agents/growth/PHASE-0-2.md`. |
| **dependencies** | `P0-ORCH` |
| **acceptance_criteria** | Single messaging ladder; UTM/source plan; referral copy matches Thank You page. |
| **quality_checks** | G5; no broken share URLs in doc. |
| **deadline** | T+2 |
| **handoff_artifacts** | `docs/agents/growth/PHASE-0-2.md` |
| **risk_notes** | Growth depends on Supabase env for live signup tests. |

---

### P0-QA — QA test matrix

| Field | Value |
|-------|--------|
| **task_id** | `P0-QA` |
| **owner_agent** | qa-test-agent |
| **objective** | Produce Phase 0–2 test matrix (smoke + regression) for current Vite app. |
| **scope** | Map flows: landing → waitlist, analytics events, privacy/terms; own `docs/agents/qa-test/PHASE-0-2.md`. |
| **dependencies** | `P0-ORCH` |
| **acceptance_criteria** | Traceable cases with pass/fail; environment column (local vs staging). |
| **quality_checks** | G0, G1; G5. |
| **deadline** | T+2 |
| **handoff_artifacts** | `docs/agents/qa-test/PHASE-0-2.md` |
| **risk_notes** | E2E automation not in package.json yet — manual smoke acceptable for Phase 2 if documented. |

---

### P0-DI — Data instrumentation

| Field | Value |
|-------|--------|
| **task_id** | `P0-DI` |
| **owner_agent** | data-instrumentation-agent |
| **objective** | Confirm schema, event dictionary, and client wiring for `waitlist_signups` + `event_logs`. |
| **scope** | Review `supabase/migrations/*.sql`, `src/lib/analytics.js`; own `docs/agents/data-instrumentation/PHASE-0-2.md`. |
| **dependencies** | `P0-ORCH` |
| **acceptance_criteria** | Event names + required metadata documented; PII boundaries stated. |
| **quality_checks** | G3; G5. |
| **deadline** | T+2 |
| **handoff_artifacts** | `docs/agents/data-instrumentation/PHASE-0-2.md` |
| **risk_notes** | Reads may be server-only; document query patterns for analytics. |

---

### P0-REV — Revenue readiness (phase gate)

| Field | Value |
|-------|--------|
| **task_id** | `P0-REV` |
| **owner_agent** | revenue-agent |
| **objective** | Document monetization timeline and gating (no payment capture in Phase 0–2 unless scoped). |
| **scope** | Own `docs/agents/revenue/PHASE-0-2.md`; pricing hypothesis vs `ARCHITECTURE` vision. |
| **dependencies** | `P0-ORCH` |
| **acceptance_criteria** | Clear “no billing yet” or “Stripe sandbox” stance; future SKU outline. |
| **quality_checks** | G5; legal/compliance touchpoints listed. |
| **deadline** | T+2 |
| **handoff_artifacts** | `docs/agents/revenue/PHASE-0-2.md` |
| **risk_notes** | Premature payment integration increases compliance scope. |

---

## Task packets — Phase 1 (parallel after P0 handoffs)

### P1-PO — Ops runbook hardening

| Field | Value |
|-------|--------|
| **task_id** | `P1-PO` |
| **owner_agent** | product-ops-agent |
| **objective** | Staging deployment checklist; incident comms template. |
| **scope** | Vercel or static host + env vars; Supabase project naming. |
| **dependencies** | `P0-PO`, `P0-DI` (schema confirmed) |
| **acceptance_criteria** | Step-by-step deploy; rollback ≤ 15 min documented. |
| **quality_checks** | G2, G3 |
| **deadline** | T+5 |
| **handoff_artifacts** | Updated `docs/agents/product-ops/PHASE-0-2.md` §Phase 1 |
| **risk_notes** | Hosting choice must match actual `package.json` (Vite). |

---

### P1-GW — Growth experiments backlog

| Field | Value |
|-------|--------|
| **task_id** | `P1-GW` |
| **owner_agent** | growth-agent |
| **objective** | Prioritized list of growth experiments (waitlist, SEO, referrals). |
| **scope** | Tie to `event_logs` names where applicable. |
| **dependencies** | `P0-GW`, `P0-DI` |
| **acceptance_criteria** | ≥3 experiments ranked; success metrics defined. |
| **quality_checks** | G5 |
| **deadline** | T+5 |
| **handoff_artifacts** | Updated `docs/agents/growth/PHASE-0-2.md` §Phase 1 |
| **risk_notes** | Depends on instrumentation for measurement. |

---

### P1-QA — Execute smoke tests

| Field | Value |
|-------|--------|
| **task_id** | `P1-QA` |
| **owner_agent** | qa-test-agent |
| **objective** | Run smoke per matrix; log results. |
| **scope** | Local + staging when URL available. |
| **dependencies** | `P0-QA`, `P1-PO` (staging URL) |
| **acceptance_criteria** | All P0 cases executed; failures filed as blockers. |
| **quality_checks** | G0, G1, G4 (when staging available) |
| **deadline** | T+5 |
| **handoff_artifacts** | Test log in `docs/agents/qa-test/PHASE-0-2.md` |
| **risk_notes** | Blocked if staging not deployed. |

---

### P1-DI — Event dictionary v1

| Field | Value |
|-------|--------|
| **task_id** | `P1-DI` |
| **owner_agent** | data-instrumentation-agent |
| **objective** | Freeze event dictionary v1; validate inserts in Supabase. |
| **scope** | Sample queries; optional dashboard notes. |
| **dependencies** | `P0-DI` |
| **acceptance_criteria** | Each event has owner, schema, and purpose. |
| **quality_checks** | G3, G4 |
| **deadline** | T+5 |
| **handoff_artifacts** | Updated `docs/agents/data-instrumentation/PHASE-0-2.md` |
| **risk_notes** | None |

---

### P1-REV — Revenue gate for Phase 2

| Field | Value |
|-------|--------|
| **task_id** | `P1-REV` |
| **owner_agent** | revenue-agent |
| **objective** | Sign-off that no unauthorized billing paths ship in Phase 2. |
| **scope** | Code scan for payment SDKs; terms alignment. |
| **dependencies** | `P0-REV` |
| **acceptance_criteria** | Written attestation in deliverable file. |
| **quality_checks** | G5 |
| **deadline** | T+5 |
| **handoff_artifacts** | Updated `docs/agents/revenue/PHASE-0-2.md` |
| **risk_notes** | None |

---

## Task packets — Phase 2 (staging & gates)

### P2-ORCH — Staging gate review

| Field | Value |
|-------|--------|
| **task_id** | `P2-ORCH` |
| **owner_agent** | orchestrator-agent |
| **objective** | Collate agent outputs; run G0–G5; publish GO/NO-GO for staging. |
| **scope** | Update `DAILY-STATUS.md`, `BLOCKERS-AND-RISKS.md`; verdict line. |
| **dependencies** | `P1-*` all complete or explicitly waived |
| **acceptance_criteria** | Single documented verdict: GO_STAGING \| NO_GO with reasons. |
| **quality_checks** | All gates attempted or waived with owner. |
| **deadline** | T+7 |
| **handoff_artifacts** | `docs/DAILY-STATUS.md`; `docs/BLOCKERS-AND-RISKS.md` |
| **risk_notes** | Production GO is **out of scope** until Phase 3+ complete. |

---

### P2-QA — Staging sign-off

| Field | Value |
|-------|--------|
| **task_id** | `P2-QA` |
| **owner_agent** | qa-test-agent |
| **objective** | Formal staging sign-off checklist. |
| **scope** | Mobile + desktop; waitlist + privacy. |
| **dependencies** | `P1-QA`, staging URL |
| **acceptance_criteria** | Signed checklist in QA deliverable. |
| **quality_checks** | G4 |
| **deadline** | T+7 |
| **handoff_artifacts** | `docs/agents/qa-test/PHASE-0-2.md` §Sign-off |
| **risk_notes** | Critical path item if launch date fixed. |

---

## Interim verdict (Phase 0–2 planning execution — 2026-04-02)

| Gate | Status |
|------|--------|
| G0 Build | **PASS** (`npm run build`) |
| G1 Lint | **PASS** (`npm run lint`) |
| G2–G5 | **Pending** agent execution + staging |

**Verdict:** **NO_GO** for **production** and **NO_GO** for **staging** until **P2-ORCH** completes and **G2–G5** pass. **GO** for local **dev quality** (build + lint only).

Reasons: no staging URL verified; agent deliverables are stubs; E2E waitlist not run against live Supabase in this session; full program (Phase 3+) not started.

---

## Full program (Phase 3+) — preview only

Deferred until Phase 2 **GO_STAGING**: curriculum/viz/frontend/chatbot per `AGENT-TASKS.md`, Next.js migration if adopted, production cutover, monetization.

Task packets for Phase 3+ will be issued after Phase 2 gate review.

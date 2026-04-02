# DataSpark — Execution DAG & Critical Path

**As-of:** 2026-04-02

---

## Legend

- **Solid edges:** hard dependency (downstream blocked until upstream done)  
- **Dashed edges:** soft dependency (can start with assumptions; reconcile later)  
- **Red:** critical path for **staging readiness**

---

## Mermaid — Phases 0–2

```mermaid
flowchart TB
  subgraph P0["Phase 0 — Bootstrap"]
    ORCH[P0-ORCH orchestrator]
    PO0[P0-PO product-ops]
    GW0[P0-GW growth]
    QA0[P0-QA qa-test]
    DI0[P0-DI data-instrumentation]
    REV0[P0-REV revenue]
    ORCH --> PO0
    ORCH --> GW0
    ORCH --> QA0
    ORCH --> DI0
    ORCH --> REV0
  end

  subgraph P1["Phase 1 — Parallel"]
    PO1[P1-PO product-ops]
    GW1[P1-GW growth]
    QA1[P1-QA qa-test]
    DI1[P1-DI data-instrumentation]
    REV1[P1-REV revenue]
    PO0 --> PO1
    DI0 --> PO1
    GW0 --> GW1
    DI0 --> GW1
    QA0 --> QA1
    PO1 -.-> QA1
    DI0 --> DI1
    REV0 --> REV1
  end

  subgraph P2["Phase 2 — Gates"]
    QA2[P2-QA staging sign-off]
    ORCH2[P2-ORCH orchestrator verdict]
    QA1 --> QA2
    REV1 --> ORCH2
    PO1 --> ORCH2
    GW1 --> ORCH2
    DI1 --> ORCH2
    QA2 --> ORCH2
  end
```

---

## Critical path (staging GO)

The longest path to **P2-ORCH** (staging verdict):

1. **P0-ORCH** → **P0-PO** → **P1-PO** (staging deploy + env documented)  
2. **P0-QA** → **P1-QA** → **P2-QA** (staging sign-off)  

**Data path** (parallel but often blocking growth measurement):

- **P0-DI** → **P1-DI** → **P2-ORCH**

**Growth experiments** are not on the critical path for *staging* unless launch requires specific experiments.

---

## Parallelism (maximize)

| After | Run in parallel |
|-------|-----------------|
| P0-ORCH | P0-PO, P0-GW, P0-QA, P0-DI, P0-REV |
| P0 complete | P1-PO, P1-GW, P1-QA (blocked on staging URL from P1-PO), P1-DI, P1-REV |
| P1 complete | P2-QA + orchestrator prep → **P2-ORCH** |

---

## Critical path — full program (Phase 3+)

Not started in this execution. Expected bottleneck (from `AGENT-TASKS.md`):

**Curriculum breadth** → **Frontend integration** → **Review/assembly** → **Deploy**

Details will be appended when Phase 2 completes.

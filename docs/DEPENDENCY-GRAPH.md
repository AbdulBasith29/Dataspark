# DataSpark — Execution DAG & Critical Path (Phase 0–2 Platform Build)

**As-of:** 2026-04-03

---

## Legend

- **Solid edges:** hard dependency (downstream blocked until upstream done)
- **Dashed edges:** soft dependency (can start with assumptions; reconcile later)
- **Red:** critical path for **staging readiness**

---

## Mermaid — Phase 0–2

```mermaid
flowchart TB
  subgraph P0["Phase 0 — Setup (2 days)"]
    ORCH[P0-ORCH orchestrator]
    CURR0[P0-CURR-DATA-MODEL curriculum-agent]
    FE0[P0-FE-FRAMEWORK frontend-agent]
    CHAT0[P0-CHAT-FOUNDATION chatbot-agent]
    DI0[P0-DICTIONARY data-instrumentation-agent]
    VIZ0[P0-VIZ-SKELETON viz-agent]
    UI0[P0-UI-OPT ui-optimizer-agent]
    ORCH --> CURR0
    ORCH --> FE0
    ORCH --> CHAT0
    ORCH --> DI0
    ORCH --> VIZ0
    ORCH --> UI0
  end

  subgraph P1["Phase 1 — Build (5 days)"]
    CURR1[P1-CURR-QUESTIONBANKS curriculum-agent]
    FE1[P1-FE-PLATFORM frontend-agent]
    CHAT1[P1-CHAT-ENDPOINTS chatbot-agent]
    DI1[P1-DI-WIRING data-instrumentation-agent]
    VIZ1[P1-VIZ-COMPONENTS viz-agent]
    UI1[P1-UI-POLISH ui-optimizer-agent]
    ORCH -.-> FE1
    CURR0 --> FE1
    CURR0 --> CURR1
    FE0 --> FE1
    CHAT0 --> CHAT1
    CHAT0 --> FE1
    DI0 --> DI1
    VIZ0 --> VIZ1
    VIZ0 --> FE1
    UI0 --> UI1
  end

  subgraph P2["Phase 2 — Integrate & Gates (6 days)"]
    REV2[P2-REVIEW-AND-INTEGRATE review-agent]
    QA2[P2-QA-SMOKE qa-test-agent]
    ORCH2[P2-ORCH verdict]
    FE1 --> REV2
    CHAT1 --> REV2
    DI1 --> REV2
    VIZ1 --> REV2
    UI1 --> REV2
    REV2 --> QA2
    QA2 --> ORCH2
  end

  %% Styling critical path: FE1 -> REV2 -> QA2 -> ORCH2
  classDef crit fill:#7f1d1d,stroke:#ef4444,color:#fff;
  class FE1,REV2,QA2,ORCH2 crit;
```

---

## Critical Path (staging readiness)

The longest hard dependency chain to the Phase 2 verdict:

1. `P0-FE-FRAMEWORK` + `P0-CURR-DATA-MODEL` + `P0-CHAT-FOUNDATION` (and parallel viz/DI/UI)  
2. `P1-FE-PLATFORM` → `P2-REVIEW-AND-INTEGRATE` → `P2-QA-SMOKE` → `P2-ORCH`

If AI endpoints (`P1-CHAT-ENDPOINTS`) slip, `P1-FE-PLATFORM` and downstream gates are blocked by missing real tutor/evaluation wiring. `P1-FE-PLATFORM` also gates on `/platform` routing + `/dashboard` redirect + secure tutor calls (no Anthropic from browser).

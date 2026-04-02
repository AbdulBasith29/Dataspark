# DataSpark — Decision Log

**Purpose:** Record product and engineering decisions so prioritization, scope cuts, and “ready/done” exceptions stay traceable.  
**Format:** Newest decisions at the **top**. Inspired by lightweight ADRs (Architecture Decision Records).

---

## How to add an entry

| Field | Description |
|--------|-------------|
| **ID** | `DEC-###` (sequential) |
| **Date** | ISO date |
| **Status** | Proposed / Accepted / Superseded / Deprecated |
| **Context** | What forced the decision |
| **Decision** | What we chose |
| **Consequences** | Tradeoffs, follow-ups |
| **Links** | Backlog IDs, PRs, docs |

---

## Log

### DEC-004 — Prioritization model for sprint backlog

| Field | Value |
|--------|--------|
| **Date** | 2026-04-02 |
| **Status** | Accepted |
| **Context** | We need a consistent way to compare curriculum, engineering, viz, chatbot, and GTM work. |
| **Decision** | Use **Impact, Revenue, Strategic fit** (higher better) and **Effort, Delivery risk** (higher worse) on a 1–5 scale per item in `docs/SPRINT-BACKLOG.md`. Priority tiers **P0 / P1 / P2** are set by judgment after reviewing scores, not by a single formula. |
| **Consequences** | Scores are comparable within an item revision; re-scoring is allowed when scope changes. Numeric ties are broken by **risk reduction** and **dependency order**. |
| **Links** | `docs/SPRINT-BACKLOG.md` |

---

### DEC-003 — “Ready” and “Done” are two-tier

| Field | Value |
|--------|--------|
| **Date** | 2026-04-02 |
| **Status** | Accepted |
| **Context** | Agents and contributors need clear gates without overloading a single definition. |
| **Decision** | **Global DoR/DoD** apply to every backlog item. **Per-item Ready/Done** in the backlog add only item-specific gates; if empty, global definitions suffice. Acceptance tests live in `docs/ACCEPTANCE-CRITERIA.md`. |
| **Consequences** | Waiving any AC requires a decision entry or explicit backlog note. |
| **Links** | `docs/SPRINT-BACKLOG.md`, `docs/ACCEPTANCE-CRITERIA.md` |

---

### DEC-002 — MVP integrates full platform with marketing site

| Field | Value |
|--------|--------|
| **Date** | 2026-04-02 |
| **Status** | Accepted |
| **Context** | `src/App.jsx` currently exposes landing/legal/thank-you routes; full platform lives under `src/app/`. |
| **Decision** | Treat **PO-005** (integrated artifact) as the path to a **single shipped experience**: authenticated or public shell as designed, with review checklist from `AGENT-TASKS` as the release gate. Exact routing strategy (basename, code-splitting) is left to implementation. |
| **Consequences** | Until PO-005 closes, marketing milestones (PO-006) can ship independently; product MVP is not “complete” without integration. |
| **Links** | PO-005, PO-006 |

---

### DEC-001 — P0 includes waitlist reliability

| Field | Value |
|--------|--------|
| **Date** | 2026-04-02 |
| **Status** | Accepted |
| **Context** | `MARKETING-PLAYBOOK.md` targets organic waitlist growth; Supabase and landing exist in-repo. |
| **Decision** | Classify **waitlist path health** as **P0** alongside core learning MVP: revenue and learning loops are both existential in pre-launch. |
| **Consequences** | Competing sprint pressure may require scoping PO-001/002 down but should not silently drop PO-006 without revisiting this decision. |
| **Links** | PO-006, `docs/MARKETING-PLAYBOOK.md` |

---

## Superseded / archived

*(None yet.)*

---

## Index by theme

| Theme | Decisions |
|--------|-----------|
| Prioritization | DEC-004 |
| Process (ready/done) | DEC-003 |
| Release / routing | DEC-002 |
| GTM vs product MVP | DEC-001 |

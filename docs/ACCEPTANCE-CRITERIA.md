# DataSpark — Acceptance Criteria

**Companion:** `docs/SPRINT-BACKLOG.md`  
**Format:** Each backlog ID has testable criteria. Use **Given / When / Then** where it clarifies behavior.

---

## PO-001 — Minimum viable question banks

1. **Schema compliance:** Every shipped question includes all required fields per `docs/ARCHITECTURE.md` (id, courseId, topicId, title, difficulty, company, type, language, estimatedMinutes, prompt, hints, modelAnswer, rubric, tags, commonMistakes).
2. **Coverage:** At least one course reaches full target question count from `ARCHITECTURE`; every other in-scope course reaches ≥50% of its target count.
3. **Difficulty mix:** Per course, distribution is approximately **30% Easy / 40% Medium / 30% Hard** (±10 percentage points per band).
4. **Code quality:** Coding prompts include a **complete** working model answer (not pseudocode); open-ended prompts include a **300–500 word** model answer where required by `AGENT-TASKS`.
5. **Rubric:** Each question has **5–9** scorable criteria; open-ended questions allow multiple valid approaches (no fake “one true answer” unless rubric says so).
6. **Build:** Question modules load without runtime errors in the integrated app.

---

## PO-002 — Core visualization pack (Phase 1: ten total, seven net-new)

**Scope:** Ten priority visualizations exist in the product (three already built per `AGENT-TASKS`; seven new components delivered in this epic).

1. **Structure:** Each component is self-contained React, default export, **no required props**.
2. **Interactivity:** User can change at least one input (slider, button, drag, or toggle) and see the visualization update.
3. **Animation:** Motion uses `requestAnimationFrame` or CSS transitions; no janky full-canvas clears every frame without purpose.
4. **Theme:** Matches dark theme tokens from `AGENT-TASKS` / `ARCHITECTURE` (e.g. background `#0B1120`, readable contrast).
5. **Labels:** Axis, legend, or dynamic text updates in sync with interaction.
6. **Embedding:** Each viz is either used in a lesson/question flow or linked from a single “Viz gallery” page that ships with the MVP.

---

## PO-003 — Learn + Practice shell

1. **Navigation:** User can move **Home → Course → Lesson → Question** and return without dead links.
2. **Course presentation:** Course grid shows all nine courses with distinct accent treatment per course (color propagation per `AGENT-TASKS`).
3. **Question UX:** Code questions show monospace editor area (JetBrains Mono); open-ended shows suitable long-form area.
4. **Submission flow:** User can submit or reveal model answer per design; rubric displays with **per-criterion** checkmarks or scoring rows.
5. **Filter/search:** Difficulty filter, tag filter, and search operate on the loaded question list without errors.
6. **Timer:** Timer can start, stop, and reset without breaking navigation state.
7. **Responsive:** At ≤768px width, layout is single-column and usable (no horizontal scroll for main content).

---

## PO-004 — Tutor MVP

1. **Coverage:** Nine course entries exist in `chatbot-config.js` and matching prompts in `system-prompts.js`.
2. **Prompt content:** Each prompt includes expert identity, subtopic/lesson scope, teaching style, **scope boundaries**, interview-prep framing, and formatting instructions per `AGENT-TASKS`.
3. **Scoping:** For each course, asking an **obviously off-topic** question yields a polite redirect and suggestion to stay in course scope (manual test matrix: 1 off-topic per course).
4. **Formatting:** Responses render markdown sensibly; code blocks use monospace when the model returns fenced code.
5. **Failure:** If the API fails, the user sees a clear error and retry path (no silent hang).

---

## PO-005 — Integrated artifact

1. **Checklist:** All items in **Review Checklist** (`docs/AGENT-TASKS.md`, Dept 5) are checked for the shipping build.
2. **Courses:** All nine courses render with correct data bindings.
3. **Viz + chat:** At least one viz and one tutor invocation per course in a **smoke script** (documented steps).
4. **Stability:** No console errors on the smoke path; mobile width smoke passes for core navigation.

---

## PO-006 — Waitlist path health

1. **Happy path:** User can submit a valid email on the landing flow and reach thank-you confirmation.
2. **Persistence:** Submission is stored per Supabase schema (or documented alternative) with success feedback.
3. **Errors:** Network failure or duplicate handling shows user-visible messaging (not blank screen).
4. **Analytics:** If `analytics` helpers exist, key events fire once per success (or document **intentionally not instrumented** in decision log).

---

## PO-007 — Full question targets

1. **Counts:** Each course meets its **Target Questions** from `docs/ARCHITECTURE.md` (or `AGENT-TASKS` where stricter).
2. **Subtopic coverage:** Questions collectively cover **all** subtopics listed for that course in architecture/agent docs (spot-check map maintained as a simple table).
3. **Regression:** PO-001 acceptance criteria still hold globally.

---

## PO-008 — Remaining visualizations

1. **Completeness:** All visualization files listed under Dept 2 in `AGENT-TASKS.md` that are not cancelled are implemented.
2. **Quality bar:** Same as PO-002 for each net-new component.

---

## PO-009 — Progress persistence

1. **Durability:** Completing a lesson/question updates stored state that survives **browser refresh**.
2. **Identity:** Document whether progress is per-login user or device; behavior matches docs.
3. **Migration:** If schema changes, existing users do not lose progress without a migration note in `DECISION-LOG.md`.

---

## PO-010 — Tutor polish

1. **Loading:** In-flight requests show loading state; double-submit prevented or harmless.
2. **Errors:** Retry does not duplicate corrupt messages in the transcript.
3. **Empty:** First-open state explains what the tutor can help with for **this** course.

---

## PO-011 — Progression gates

1. **Rules:** Module completion and quiz pass criteria match the agreed thresholds in the decision log.
2. **UX:** Locked lessons show **why** locked and **what** unlocks them.
3. **Quizzes:** Module quizzes draw from defined pools; scoring matches displayed rubric.

---

## PO-012 — Content QA pipeline

1. **Process:** Written steps for sampling (e.g. 10% random + all Hard questions).
2. **Defects:** Issues are tracked with severity; **blocker** fixes before next public push.

---

## PO-013 — Clip-ready demos

1. **Assets:** At least **three** short clips (≤60s) featuring real product UI.
2. **CTA:** Each clip description or end frame points to waitlist or canonical URL.

---

## PO-014 — Code runner (optional)

1. **Sandbox:** User code cannot read arbitrary secrets or escape the sandbox.
2. **Limits:** CPU/time/memory caps documented; user sees friendly message on limit hit.
3. **Languages:** Only languages explicitly in scope (e.g. Python/SQL) are enabled.

---

## Waiving criteria

Any waived criterion must be recorded in `docs/DECISION-LOG.md` with **owner**, **date**, and **reason**.

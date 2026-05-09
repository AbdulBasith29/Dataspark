# DataSpark — 7-Day Ship Readiness Plan

**Prepared:** 2026-04-27  
**Goal:** Move from "partially verified" to a documented GO/NO-GO release decision for the current web app.

---

## Top priorities (in order)

1. **Staging environment verification** (AI routes + Supabase end-to-end).
2. **Quality gates** (`npm run lint`, `npm run build`, regression checklist).
3. **Release governance artifacts** (bug tracker entries, release quality report, sign-off).
4. **Curriculum data extraction** (de-monolith `dataspark-full-platform.jsx` question/rubric data).

---

## Owners

- **Engineering:** code fixes, API/infra verification, migrations, deployment config.
- **QA:** regression checklist, critical flow execution, bug filing.
- **Product/Ops:** release report, waivers (if needed), final sign-off and rollback plan.

---

## Day-by-day execution

### Day 1 — Environment and deployment parity

- Confirm staging URL is live and routes render (`/`, `/platform`, `/privacy`, `/terms`, `/contact`, `/thank-you`).
- Configure env vars on host:
  - `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Run migration `supabase/migrations/20260402000000_waitlist_and_events.sql` on staging DB.
- Verify API reachability:
  - `POST /api/ai/chat`
  - `POST /api/ai/evaluate`

**Exit criteria:** all above confirmed and documented with timestamp/screenshots/log snippets.

### Day 2 — Core quality gates

- Run `npm run lint` and `npm run build` on release branch.
- Triage and file any warnings that are accepted for this release.
- Capture build artifact size and note any known performance risks.

**Exit criteria:** zero lint **errors** and successful production build.

### Day 3 — Functional QA pass (manual)

- Execute all sections A–F in `docs/REGRESSION-CHECKLIST.md` on staging.
- Execute critical flows CF-1 to CF-7 in `docs/TEST-PLAN.md`.
- Log defects in `docs/BUG-TRACKER.md` with severity (P0–P3), repro, owner, target fix date.

**Exit criteria:** no open P0/P1 or explicit waiver draft prepared.

### Day 4 — Fix + verify loop

- Address all P0/P1 defects.
- Re-run relevant regression sections.
- Verify duplicate waitlist behavior and missing-env behavior still show friendly errors.

**Exit criteria:** all P0/P1 closed (or waiver approved with mitigation + expiry).

### Day 5 — Data/curriculum hardening

- Extract embedded question/rubric blocks from `src/app/dataspark-full-platform.jsx` into `src/data/questions-*.js` files.
- Ensure imports are by stable course/question IDs.
- Re-run lint/build and targeted platform smoke.

**Exit criteria:** platform still functional with externalized data modules.

### Day 6 — Release artifact completion

- Fill `docs/RELEASE-QUALITY-REPORT.md` completely:
  - build SHA
  - environment
  - completed test artifacts
  - open defect counts
  - waivers (if any)
  - final recommendation
- Ensure bug tracker is current and not template-only.

**Exit criteria:** release packet is complete and auditable.

### Day 7 — Final GO/NO-GO and production smoke plan

- Conduct final triad review (Engineering + QA + Product/Ops).
- Decide GO/NO-GO against release gate policy.
- If GO: publish deployment command sequence and rollback procedure.
- After deploy: perform production smoke and log outcome.

**Exit criteria:** signed final status + post-release checks scheduled/owned.

---

## Hard ship gates (must pass)

- `npm run lint` has **no errors**.
- `npm run build` succeeds.
- Regression checklist complete for target environment.
- No open P0 defects.
- No open P1 defects unless waiver includes approver, mitigation, and expiry.
- AI routes and Supabase waitlist/event flow validated in deployed environment.

---

## Command runbook

```bash
# local quality
npm ci
npm run lint
npm run build

# local preview (optional)
npm run preview

# staging API smoke examples
curl -X POST "$STAGING_URL/api/ai/chat" -H "content-type: application/json" -d '{"system":"You are concise.","messages":[{"role":"user","content":"ping"}]}'

curl -X POST "$STAGING_URL/api/ai/evaluate" -H "content-type: application/json" -d '{"questionPrompt":"What is A/B testing?","userAnswer":"Randomized experiment for causal inference.","rubric":["Defines controlled experiment","Mentions randomization"]}'
```

---

## Notes from today (2026-04-27)

- Lint blockers and hook-dependency warnings were addressed; `npm run lint` is now clean.
- Build passes with chunk-size warnings (non-blocking for current release, but should be tracked).

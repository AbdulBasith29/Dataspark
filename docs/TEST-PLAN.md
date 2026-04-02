# DataSpark — Test Plan

**Owner:** QA  
**Scope:** Marketing site + waitlist funnel (current). Learning platform items are **planned** per `docs/AGENT-TASKS.md` and should be activated when those routes ship.

---

## 1. Objectives

- Verify critical user journeys work end-to-end without data loss or misleading success states.
- Confirm analytics and backend integration behave as designed (non-blocking analytics, authoritative waitlist in Supabase).
- Establish repeatable coverage for releases and regressions.

---

## 2. Environments

| Environment | Purpose | Notes |
|---------------|---------|--------|
| **Local dev** | Developer verification | `npm run dev`; requires `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for full waitlist tests. |
| **Staging / preview** | Pre-release QA | Match production env vars; run migration `supabase/migrations/20260402000000_waitlist_and_events.sql` (or equivalent). |
| **Production** | Release validation | Post-deploy smoke + sampled funnel check. |

**Data:** Use dedicated test emails (e.g. `qa+<timestamp>@yourdomain.com`) in non-production where possible. Do not use real PII in shared bug reports.

---

## 3. Severity model (P0–P3)

| Severity | Definition | Examples | Target response |
|----------|------------|----------|-------------------|
| **P0** | Blocker: complete loss of primary value, security issue, or incorrect “success” when operation failed | Site blank; waitlist appears to succeed but no row created; auth/RLS misconfiguration exposing data inappropriately | Fix before any release; no waiver without exec sign-off |
| **P1** | Critical: primary flow broken for many users; no reasonable workaround | Submit never completes; thank-you never reachable; duplicate handling wrong (allows double opt-in spam or blocks everyone) | Fix before release or documented hotfix within 24h |
| **P2** | Major: degraded experience; workaround exists | Analytics events missing but signup works; minor UI break on one browser | Schedule next patch; may ship with waiver |
| **P3** | Minor: cosmetic, copy, edge-case | Typo, slight misalignment, rare browser quirk | Backlog |

**Escalation:** P0/P1 discovered in production → notify owner immediately; capture repro, time, environment, and user impact.

---

## 4. Critical flows — current product

### CF-1: Landing page load and navigation

- **Pre:** Clean session; JavaScript enabled.
- **Steps:** Open `/`. Scroll hero; use header nav “Secure Your Spot” to scroll to `#join`. Use footer links to `#how-it-works`, `#features`, `#courses` via in-page anchors where applicable.
- **Expected:** No uncaught console errors in happy path; layout readable on desktop and mobile breakpoints; focus remains usable on waitlist inputs (known: `WaitlistCTA` is module-scoped to preserve focus).

### CF-2: Waitlist — successful signup

- **Pre:** Supabase project has `waitlist_signups` + RLS insert policy; env vars set.
- **Steps:** Enter valid unique email → submit from **hero** CTA → observe redirect to `/thank-you`.
- **Expected:** Row in `waitlist_signups` with normalized email (`lower(trim)`), `source` = `landing_v8`; user lands on thank-you; success analytics may fire (`safeLogClientEvent` — failures must not block UX).

### CF-3: Waitlist — validation and errors

- Invalid email format → inline error; `form_submit_error` with `reason: invalid_email` (if logging succeeds).
- Duplicate email → user-friendly duplicate message; no duplicate row.
- Missing Supabase env → clear error, no crash.
- Supabase errors (RLS, missing table, bad key) → mapped messages per `waitlistErrorMessage` in `landing-page.jsx`; no silent success.

### CF-4: Thank-you page

- Load `/thank-you` directly and via redirect after signup.
- **Copy invite link:** copies origin + `/`; analytics `thank_you_share_click` / `copy_link` when logging works.
- **Share (if `navigator.share` exists):** invokes share; cancel does not crash.
- **Back to home** returns to `/`.

### CF-5: Static / legal / contact

- `/privacy`, `/terms` render with `PageShell` and readable content.
- `/contact` shows placeholder form; submit shows placeholder message (no backend — **expected** until integrated).

### CF-6: Routing and 404

- Unknown path redirects to `/` (`Navigate` catch-all).

### CF-7: Analytics resilience

- With Supabase unavailable for `event_logs`, core flows still complete (verify `safeLogClientEvent` swallows errors).

---

## 5. Critical flows — planned learning platform (future)

Activate when `docs/AGENT-TASKS.md` deliverables are merged and routed in `App.jsx`.

| Flow | Summary |
|------|---------|
| **PF-1** | Home / course grid → course → lesson → question |
| **PF-2** | Question: code + open-ended display, rubric, model answer reveal |
| **PF-3** | Progress persistence (or state) across lessons |
| **PF-4** | Search / filter by difficulty and tags |
| **PF-5** | AI tutor: on-topic responses; scope boundaries per `system-prompts.js` |
| **PF-6** | Embedded visualizations load and animate without freezing main thread |

---

## 6. Non-functional checks

- **Performance:** First paint acceptable on 3G simulated; no infinite loops in animations.
- **Accessibility (baseline):** Keyboard submit on waitlist (Enter); focus visible on inputs; sufficient contrast for primary text.
- **Security:** No secrets in client bundle beyond public anon key; RLS prevents destructive anon access per migration intent.

---

## 7. Test types

| Type | Role |
|------|------|
| **Manual exploratory** | New features, UX edge cases |
| **Scripted regression** | `docs/REGRESSION-CHECKLIST.md` each release |
| **Automated** | Add when stable (E2E for waitlist + routing recommended) |

---

## 8. Entry and exit criteria

**Entry (QA cycle starts):** Build deployed to staging; release notes / diff known; P0 backlog empty or explicitly in scope.

**Exit (QA signs off):** All **release gate** conditions in `docs/RELEASE-QUALITY-REPORT.md` met; open defects triaged per severity policy.

---

## 9. References

- Routing: `src/App.jsx`
- Waitlist + funnel: `src/app/landing-page.jsx`, `src/lib/supabaseClient.js`, `src/lib/analytics.js`
- Schema: `supabase/migrations/20260402000000_waitlist_and_events.sql`
- Roadmap: `docs/AGENT-TASKS.md`

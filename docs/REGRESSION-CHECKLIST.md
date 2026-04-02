# DataSpark — Regression Checklist

Use **before each release** (staging first) and **after hotfixes**. Mark items **Pass / Fail / N/A**. Any **Fail** must have a linked defect in `docs/BUG-TRACKER.md` with P0–P3.

**Timebox:** ~15–25 minutes for current marketing scope; add time when learning platform routes exist.

---

## Release metadata

| Field | Value |
|-------|--------|
| Build / commit | |
| Environment | |
| Tester | |
| Date | |

---

## A. Smoke — routing & shell

- [ ] `/` loads without blank screen
- [ ] `/privacy` loads
- [ ] `/terms` loads
- [ ] `/contact` loads
- [ ] Random path (e.g. `/does-not-exist`) redirects to `/`
- [ ] `BrowserRouter` `basename` respected if deployed under subpath (`import.meta.env.BASE_URL`)

---

## B. Landing — UX & content

- [ ] Hero and sections render; no obvious layout break at **375px** and **1280px** width
- [ ] Header “Secure Your Spot” scrolls to waitlist (`#join`)
- [ ] Hero card toggles “The Old Way” / “The DataSpark Way”
- [ ] Footer internal links: Privacy, Terms, Contact (React Router)
- [ ] Footer external links open in new tab with `rel="noopener noreferrer"` (TikTok, LinkedIn, Twitter)

---

## C. Waitlist — functional (requires Supabase + env)

- [ ] Invalid email shows error; submit does not navigate away
- [ ] Valid **new** email: success path → **`/thank-you`**
- [ ] Duplicate email: friendly message; not treated as generic failure
- [ ] Button shows busy state during request; double-submit prevented while busy
- [ ] With env vars **missing**, user sees availability error (no crash)

---

## D. Thank-you

- [ ] Page renders with branding and “Back to home” → `/`
- [ ] “Copy invite link” works (manual paste check) and toggles copied state
- [ ] On supported mobile browsers, “Share…” does not throw (cancel is OK)
- [ ] Contact link at bottom works

---

## E. Contact page (placeholder)

- [ ] Form submit shows placeholder confirmation (expected: no server POST yet)
- [ ] `mailto:hello@dataspark.ai` link works from page copy

---

## F. Console & network

- [ ] No repeated uncaught errors during happy-path signup
- [ ] Failed analytics (`event_logs`) does **not** block signup (optional: simulate by breaking insert policy for `event_logs` only — signup should still succeed)

---

## G. Planned platform (N/A until shipped)

When course/question/chatbot routes are live, extend with:

- [ ] Course grid → course → lesson → question navigation
- [ ] At least one visualization interaction
- [ ] AI tutor sends a message and stays in topic scope
- [ ] Progress indicator updates after completing a lesson step

---

## Sign-off

| Role | Name | Pass? |
|------|------|-------|
| QA | | |
| Release owner | | |

**Policy:** Do not ship with open **P0**; **P1** requires fix, waiver with owner approval, or agreed hotfix timeline. See `docs/RELEASE-QUALITY-REPORT.md`.

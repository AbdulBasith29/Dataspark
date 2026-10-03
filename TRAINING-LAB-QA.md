# SQL training lab: scope and verification

## October 3 mobile polish follow-up

- Platform navigation at widths up to 700px now collapses behind an accessible Menu button, retaining the original logo. Opening it reveals Home, Insights, wrapped course buttons and the existing account menu. Course selection and Escape close it. Desktop navigation and the original 640px content-grid breakpoint remain intact.
- Lab supporting text now uses the existing brighter `DS.t2` colour at 14px. The editor has an associated, non-spoiling starting instruction.
- View changes focus without automatic scrolling, then position the section below the measured platform header with room for the view tabs.
- Eight regression tests and the production build pass; lab-component lint passes. Existing build warnings remain.
- **NOT VERIFIED:** browser appearance and interaction for this follow-up. Browser security rejected reopening the local preview. Earlier browser results below apply to the previous commit only. Check 315/360/390/430px widths, menu open/close and keyboard access, Brief/Work/Feedback transitions, and desktop layout before merging. Live AI, account persistence and native-device checks remain outstanding.

## Scope

The `sqq3` question, Funnel Conversion by City, uses `SqlTrainingLab.jsx` inside the existing platform navigation. Existing DataSpark logo, wordmark, shared typography and design tokens are unchanged. Other question screens remain on `PracticeQuestion`.

The lab separates running SQL, comparing output and requesting an AI rubric assessment. The editor stays editable, feedback retains its submitted answer, and changed drafts mark old output and assessments as stale. Coaching opens a reviewable draft in the existing tutor. An explicit save waits for Supabase acknowledgement before claiming success.

Both hosted and development evaluation endpoints now return HTTP 503 without a score when configuration, providers or response validation fail. This correction affects all consumers of that endpoint, not only sqq3. Genuine zero scores remain valid. No authentication, schema or provider-model changes were made.

## Verified locally

- `node --test scripts/test-training-lab.mjs`: 8 passing tests covering provider failure, malformed grades, genuine zero grades, local API failure, save acknowledgements, preserving a previously read higher score, and real PostgreSQL execution/comparison/error recovery.
- Focused ESLint check passes for the new component, helpers, evaluator endpoints, preview and tests.
- Production build passes. Existing duplicate `sq-a1`, PGlite external-module/eval and large-bundle warnings remain.
- Browser component QA: real SQL output and mismatch; invalid-column error followed by successful execution; draft and prior assessment retained when leaving/returning; stale-output labelling; AI pending/unavailable states; failed save and successful retry; coaching context includes the assessed SQL rather than an edited draft.
- Responsive checks at 360, 390 and 430 CSS pixels showed no document horizontal overflow. Desktop and phone screenshots were captured. The phone uses Brief/Work/Feedback navigation and a 16px editor.

## Reproduce component QA

Run `npm run dev`, then open `/scripts/training-lab-preview.html`. The banner explicitly identifies AI and save fixtures. SQL executes against the existing local PGlite seed; no account writes occur. Change the fixture selectors to exercise failures, and use Leave task / Return to task to check session retention. This harness is not an application route or a production build entry.

## NOT VERIFIED / limitations

- Live Anthropic/Gemini responses, authenticated Supabase writes/RLS and the full signed-in application journey have NOT BEEN VERIFIED in this checkout. Fixtures establish UI behaviour, not live service health.
- Native Android/iOS builds, Capacitor API addressing, device keyboards, safe areas and physical-device performance have NOT BEEN VERIFIED. The separate mobile foundation branch is unchanged.
- Drafts and one assessment are held in memory while the platform is mounted; reloads lose them. No persisted attempt history or cross-session improvement is claimed.
- Scores use the existing best-score table. The read-then-upsert preserves a higher score observed by this client but is not atomic across simultaneous tabs/devices. Atomic best-score updates require a separate backend change.
- SQL comparison reuses existing semantics: row order and aliases ignored; numeric values normalised to two decimal places. It is not proof of correctness for unseen data.
- The legacy question UI outside sqq3 has not been redesigned. Its existing retry behaviour should be addressed separately.
- A preview-only duplicate-root warning during hot reload was fixed by separating the preview component from its HTML mount entry.

## Before merging

Verify the authenticated flow in a non-production test account: open SQL practice sqq3, run/check, obtain real feedback, revise, open tutor, save and revisit progress. Exercise unavailable providers and a rejected database write. Review both desktop and physical-phone behaviour. Do not treat this draft PR as deployment or native-release approval.

# DataSpark — Bug Tracker

**How to use:** Append new rows to the **Open defects** table. When fixed, move the row to **Resolved** with fix version and date. Link PRs or commits in **Notes**.

---

## Severity policy (P0–P3)

| ID | Name | Meaning | Release handling |
|----|------|---------|------------------|
| **P0** | Blocker | Primary value broken for all or most users; security vulnerability; data integrity violation; false success | **No release** until fixed or emergency patch is deployed |
| **P1** | Critical | Primary flow broken for a clear segment; severe degradation; acceptable workaround rare | **No release** without fix, waiver with named approver, or same-day hotfix plan |
| **P2** | Major | Noticeable defect; workaround exists | May ship with documented workaround; fix in next patch |
| **P3** | Minor | Cosmetic, typo, low-frequency edge case | Backlog; batch in routine releases |

**Waiver rules (P1):** Product + engineering sign-off; user-facing risk documented; mitigation (e.g. feature flag off) in place.

---

## Open defects

| ID | Opened | Severity | Area | Summary | Steps to reproduce | Owner | Target |
|----|--------|----------|------|---------|--------------------|-------|--------|
| — | YYYY-MM-DD | P? | e.g. Waitlist | | 1. … 2. … | | |

*(No template rows — add real issues as discovered.)*

---

## Resolved defects

| ID | Opened | Closed | Severity | Summary | Fix version / commit |
|----|--------|--------|----------|---------|----------------------|
| — | | | | | |

---

## Fields (reference)

- **ID:** `DS-###` or tracker key (e.g. Jira) — keep stable across status changes.
- **Area:** Landing, Waitlist, Thank-you, Legal, Contact, Analytics, Auth, Platform (future), Infra, Other.
- **Environment:** local / staging / production + browser/OS if UI.
- **Evidence:** screenshots, HAR (redact tokens), Supabase error codes.

---

## Triage workflow

1. **New** → confirm repro → assign severity using table above.  
2. **P0/P1** → notify on-call / owner immediately.  
3. **Fix** → link PR; QA verifies on staging.  
4. **Close** → move to Resolved; note regression test added or checklist item updated if applicable.

---

## Contact with release gate

Open **P0** or unwaived **P1** items **block release** per `docs/RELEASE-QUALITY-REPORT.md`. Update this document before marking a release **Ready**.

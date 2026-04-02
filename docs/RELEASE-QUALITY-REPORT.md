# DataSpark — Release Quality Report

**Release:** _(tag or version)_  
**Build / commit:** _SHA_  
**Environment validated:** _(staging / production)_  
**Report date:** _(YYYY-MM-DD)_  
**Author:** _(QA / engineer name)_

---

## 1. Summary

| Result | Ready to ship? ☐ Yes ☐ No |
|--------|---------------------------|
| **One-line summary** | |

---

## 2. Scope of change

Briefly list what this release contains (features, fixes, config, migrations):

- 
- 

**Database / migrations:** _(e.g. `20260402000000_waitlist_and_events.sql` applied to target Supabase project: Yes / No / N/A)_

---

## 3. Test execution

| Artifact | Completed? |
|----------|------------|
| `docs/REGRESSION-CHECKLIST.md` (this environment) | ☐ |
| Critical flows in `docs/TEST-PLAN.md` for in-scope areas | ☐ |
| Smoke on production _(if staging was primary, note post-deploy smoke plan)_ | ☐ |

**Notes on coverage gaps:** _(e.g. “Analytics table not verified in prod — read policy N/A”)_

---

## 4. Defect status at release decision

| Severity | Open count | IDs or summary |
|----------|------------|----------------|
| P0 | | **Must be 0 for Ready** |
| P1 | | **Must be 0 or waived** — see §5 |
| P2 | | |
| P3 | | |

**Link:** `docs/BUG-TRACKER.md` — last updated _(date)_.

---

## 5. Waivers and exceptions

_List only if applicable._

| Item | Severity | Approver | Mitigation | Expiry |
|------|----------|----------|------------|--------|
| | | | | |

If no waivers: state **None**.

---

## 6. Release gate policy (mandatory checks)

A release may be marked **Ready** only when **all** of the following are true:

1. **Zero open P0** defects for in-scope functionality.
2. **Zero open P1** defects unless a written **waiver** is recorded in §5 with approver and mitigation.
3. **Regression checklist** completed for the target build on **staging** (or production if staging is unavailable — justify in §3).
4. **Migrations / env:** Production Supabase has required tables and RLS policies if waitlist is enabled; `VITE_SUPABASE_*` (or documented aliases) match the intended project.
5. **Rollback / monitoring:** Known rollback step documented (e.g. redeploy previous artifact; revert migration only if safe and planned).
6. **Security / privacy:** No new client-side exposure of service role keys; public anon usage aligned with migration.

**Automatic fail (not Ready):** Any open P0; any unwaived P1 affecting primary signup or legal pages.

---

## 7. Sign-off

| Role | Name | Date | Approved? |
|------|------|------|-----------|
| QA | | | ☐ |
| Engineering / release owner | | | ☐ |
| Product _(if P1 waiver or major UX risk)_ | | | ☐ N/A |

**Final status:** ☐ **Ready** ☐ **Not ready**

---

## 8. Post-release

- [ ] Monitor error rates / Supabase logs for `waitlist_signups` and `event_logs` _(as applicable)_  
- [ ] Spot-check one successful signup path on production within **24h**  
- [ ] Close or update deferred P2/P3 items with next milestone

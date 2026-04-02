# DataSpark — Data Quality Checks

Operational and analytical validation for `public.event_logs` and related analytics. **`metadata.category`** must be one of: `acquisition`, `activation`, `engagement`, `conversion`, `retention`, `referral`, `system`.

---

## 1. Schema presence checks

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-01 | `event_name` is not null and not empty string. | Block |
| DQ-02 | `event_name` matches `^[a-z0-9_]+$` (snake_case). | Warn |
| DQ-03 | `metadata` is null OR JSON object (not string scalar at top level). | Warn |
| DQ-04 | `metadata->>'category'` exists and is in the allowed enum (seven values). | Warn → Block once rollout complete |

**Implementation note:** Enforce DQ-04 in application code (`logClientEvent`) before insert when ready; DB check constraint optional (jsonb validation via trigger).

---

## 2. Contract checks (per event)

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-10 | `form_submit_success` must include `email_domain` when present in code path (nullable if blocked). | Warn |
| DQ-11 | `form_submit_error` must include `reason` when possible. | Warn |
| DQ-12 | `thank_you_share_click` must include `action` ∈ {`copy_link`,`native_share`}. | Warn |
| DQ-13 | Product events with `course_id` must use allowed course ids (see `EVENT-TAXONOMY.md`). | Warn |

---

## 3. Volume & anomaly checks

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-20 | Daily row count vs 7-day rolling median: alert if >3× or <0.1× (excluding known launches). | Alert |
| DQ-21 | Zero `form_submit_success` for 24h on production while landing is live. | Alert |
| DQ-22 | Spike in `form_submit_error` with `category` = `system` (>5% of attempts in a day). | Alert |

---

## 4. Duplication & ordering

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-30 | Same `event_name` + same `created_at` to the millisecond: acceptable at low volume; investigate bursts. | Info |
| DQ-31 | `thank_you_share_click` without prior `form_submit_success` same session: possible if user bookmarked `/thank-you` — track rate; high rate = instrumentation bug. | Warn |

*(Session-level DQ-31 requires `session_id` in metadata.)*

---

## 5. PII & safety

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-40 | No `metadata` key equals `email` with email-shaped value. | Block (code review + spot queries) |
| DQ-41 | `metadata` text fields length < 2k chars (prevent accidental paste dumps). | Warn |

**Spot query (admin, rare):**

```sql
select id, event_name, metadata
from public.event_logs
where metadata::text ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}'
limit 50;
```

Should return **zero** rows in production.

---

## 6. Referential sanity (future)

| Check ID | Rule | Severity |
|----------|------|----------|
| DQ-50 | `question_id` on product events exists in question bank export (nightly job). | Warn |
| DQ-51 | `lesson_id` exists in course manifest (nightly job). | Warn |

---

## 7. Runbook

1. **Daily:** Automated SQL or BI alert on DQ-20, DQ-21, DQ-22.  
2. **Weekly:** Sample 100 random rows from last 7 days for DQ-01–04 and DQ-40.  
3. **On taxonomy change:** Re-run contract checks DQ-10–13 against new events; update this file.

---

## 8. Ownership

- **Engineering:** implements client validation and fixes PII leaks.  
- **Product analytics:** owns thresholds for DQ-20–22.  
- **On incident:** disable noisy events only after renaming in taxonomy doc (never silent schema drift).

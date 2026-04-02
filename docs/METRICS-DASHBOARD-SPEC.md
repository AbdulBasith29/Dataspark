# DataSpark — Metrics Dashboard Spec

Specification for a **product / growth dashboard** backed by `public.event_logs` (and `public.waitlist_signups` where noted). All event-level metrics assume **`metadata.category`** uses the standard enum: `acquisition`, `activation`, `engagement`, `conversion`, `retention`, `referral`, `system`.

---

## 1. Audience & cadence

| Audience | Cadence | Focus |
|----------|---------|--------|
| Growth / marketing | Daily | Waitlist funnel, referral, acquisition quality |
| Product | Weekly | Activation, engagement depth, AI tutor usage |
| Engineering | Daily / on-call | System error rate, insert failures |

---

## 2. Core dimensions

| Dimension | Source | Notes |
|-----------|--------|--------|
| `event_name` | `event_logs.event_name` | Primary breakdown. |
| `category` | `metadata->>'category'` | Must match taxonomy; filter invalid rows in QC. |
| `page` | `event_logs.page` | Route or logical screen. |
| `day` | `date_trunc('day', created_at AT TIME ZONE 'UTC')` | Default timezone UTC; document if changed. |
| `email_domain` | `metadata->>'email_domain'` | Aggregate only; never user-level export without policy. |
| `location` | `metadata->>'location'` | `hero`, `final`, etc. |
| `course_id` | `metadata->>'course_id'` | Product metrics (when instrumented). |

---

## 3. KPI panels (v1 — waitlist era)

### Panel W1 — Waitlist volume

- **Metric:** Count of rows in `waitlist_signups` per day.  
- **Chart:** Line (daily).  
- **Table:** Total all-time, last 7 / 30 days.

### Panel W2 — Landing CTA engagement

- **Metrics:** Count of `hero_cta_click`, `final_cta_click` per day (`category` = `acquisition`).  
- **Chart:** Stacked bar or two lines.  
- **Derived:** CTA clicks per unique day (approximate until `session_id`).

### Panel W3 — Form conversion

- **Numerator:** `form_submit_success` (`category` = `conversion`).  
- **Denominator:** `form_submit_success` + business `form_submit_error` (`invalid_email`, `duplicate_email`) — optional: include `hero_cta_click` + `final_cta_click` as intent denominator.  
- **Chart:** Single stat + trend line.

### Panel W4 — Error split

- **Metrics:** Count `form_submit_error` where `metadata->>'reason'` groups into **business** vs **system** (see `FUNNEL-DEFINITIONS.md`).  
- **Chart:** Donut or stacked bar.  
- **Alert:** Spike in `system` bucket.

### Panel W5 — Referral

- **Metric:** `thank_you_share_click` (`category` = `referral`) by `metadata->>'action'`.  
- **Chart:** Bar (copy vs native share).

---

## 4. KPI panels (v2 — product, when events exist)

### Panel P1 — Activation rate (7-day)

- **Definition:** From `FUNNEL-DEFINITIONS.md` Funnel B.  
- **Inputs:** `page_view` (dashboard/courses), `lesson_complete` or `question_submit` (choose one north-star).  
- **Chart:** Cohort funnel or weekly ratio.

### Panel P2 — Engagement depth

- **Metrics:** Distinct `question_id` per week (from `question_open`), lessons started per user-session proxy.  
- **Chart:** Histogram or box plot (if warehouse supports).

### Panel P3 — AI tutor

- **Metrics:** `tutor_open`, `tutor_message_send`; ratio messages/opens.  
- **Chart:** Two lines + ratio.

---

## 5. SQL sketches (Supabase / Postgres)

**Daily event counts by name:**

```sql
select
  date_trunc('day', created_at at time zone 'UTC')::date as day,
  event_name,
  count(*) as events
from public.event_logs
group by 1, 2
order by 1 desc, 3 desc;
```

**Waitlist success with category guard:**

```sql
select
  date_trunc('day', created_at at time zone 'UTC')::date as day,
  count(*) filter (
    where event_name = 'form_submit_success'
      and coalesce(metadata->>'category', 'conversion') = 'conversion'
  ) as waitlist_success
from public.event_logs
group by 1
order by 1 desc;
```

*(Adjust filter once all rows include `category`.)*

---

## 6. Access & PII

- Dashboards are **aggregate-only** for domains and counts.  
- No drill-down to individual email from `event_logs` (waitlist PII lives in `waitlist_signups`; restrict to admin tools).

---

## 7. Refresh & SLAs

- **Source:** OLTP tables; for heavy reporting, replicate to warehouse later.  
- **Latency:** T+0 to minutes; acceptable for daily growth review.  
- **Owner:** DataSpark team rotates dashboard QA when `EVENT-TAXONOMY.md` changes.

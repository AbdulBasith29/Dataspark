# DataSpark — Funnel Definitions

Formal funnel steps for analysis. All counts use `public.event_logs` unless noted. **`metadata.category`** must follow the standard enum (`acquisition`, `activation`, `engagement`, `conversion`, `retention`, `referral`, `system`).

---

## Funnel A — Waitlist acquisition (live)

**Goal:** Measure landing → signup → optional share.

| Step | Name | Definition | Primary `event_name` | `category` |
|------|------|------------|----------------------|------------|
| A1 | Landing interest | User clicks primary CTA (hero or final). | `hero_cta_click` OR `final_cta_click` | `acquisition` |
| A2 | Form outcome — success | Email accepted and row inserted. | `form_submit_success` | `conversion` |
| A2-alt | Form outcome — business failure | Invalid or duplicate email. | `form_submit_error` where `reason` ∈ {`invalid_email`,`duplicate_email`} | `conversion` |
| A2-sys | Form outcome — system failure | Env/DB issue. | `form_submit_error` where `reason` ∈ {`missing_supabase_env`,`supabase_insert_failed`} | `system` |
| A3 | Thank-you referral | User shares or copies invite link. | `thank_you_share_click` | `referral` |

**Conversion rate (core):**  
`A2_unique_emails / A1_unique_sessions` — approximate A1 with unique `(session_id or anonymous device bucket)` once `session_id` exists; until then use daily unique `page` + coarse dedupe.

**Quality note:** A1 is intent, not email validity; pair with A2 for true conversion.

---

## Funnel B — Activation (product — planned)

**Goal:** First learning value within the authenticated or anonymous product session.

| Step | Name | Definition | Primary `event_name` | `category` |
|------|------|------------|----------------------|------------|
| B1 | App entry | User hits main app route after launch. | `page_view` on `/dashboard` or `/courses` | `engagement` |
| B2 | First lesson start | First `lesson_start` per `session_id` or user. | `lesson_start` | `engagement` |
| B3 | First question open | First `question_open`. | `question_open` | `engagement` |
| B4 | Activation — “aha” | **Option 1:** `lesson_complete` **Option 2:** `question_submit` (choose one as north-star for v1). | `lesson_complete` or `question_submit` | `conversion` |

**Activation rate:** users reaching B4 / users reaching B1 (same cohort window, e.g. 7 days).

---

## Funnel C — Practice depth (planned)

| Step | Name | Definition | `event_name` | `category` |
|------|------|------------|--------------|------------|
| C1 | Question opened | Workspace loaded. | `question_open` | `engagement` |
| C2 | Answer submitted | At least one submit. | `question_submit` | `conversion` |
| C3 | Rubric engaged | User views rubric/model answer. | `rubric_view` | `engagement` |

**Step conversion:** C2/C1, C3/C2.

---

## Funnel D — AI tutor (planned)

| Step | Name | Definition | `event_name` | `category` |
|------|------|------------|--------------|------------|
| D1 | Tutor opened | Panel opened from lesson or question. | `tutor_open` | `activation` |
| D2 | Message sent | ≥1 user message. | `tutor_message_send` | `engagement` |

**Adoption:** D1/B1; **depth:** D2/D1.

---

## Funnel E — Referral loop (live + planned)

| Step | Name | Definition | `event_name` | `category` |
|------|------|------------|--------------|------------|
| E1 | Share action | Copy or native share. | `thank_you_share_click` | `referral` |

Downstream: attribute new `form_submit_success` with `source` / referral params when UTM or referral codes exist (future).

---

## Global definitions

- **Session:** Browser session when `session_id` is implemented; until then use `created_at` date + `page` as a crude proxy (document limitations in dashboards).  
- **Unique user (pre-auth):** Not directly knowable; use `email_domain` only at aggregate for waitlist, never for cross-funnel user stitching without consent.  
- **Exclusions:** `system` category events are **out** of conversion numerators unless the metric explicitly tracks reliability.

---

## Change control

When funnel steps change, update this file and the dashboard spec in the same change. Version column in warehouse tables (if added later) should map to “funnel definition revision.”

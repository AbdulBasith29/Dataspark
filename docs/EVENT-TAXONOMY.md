# DataSpark — Event Taxonomy

Canonical reference for client and server-side analytics. Aligns with `public.event_logs` (`event_name`, `page`, `metadata`) and `src/lib/analytics.js`.

---

## Required event categories

Every event’s `metadata` **must** include `category` set to exactly one of:

| `category` value | Purpose |
|------------------|---------|
| `acquisition` | Traffic, landing engagement, CTAs, outbound links (top-of-funnel intent). |
| `activation` | First value moments (first lesson, first question, first tutor open). |
| `engagement` | Repeat depth: lessons, practice, visualizations, time-on-task signals. |
| `conversion` | Completed goals: waitlist success, lesson complete, rubric submit, etc. |
| `retention` | Return visits, streaks, spaced-repetition actions, session continuity. |
| `referral` | Share, copy-link, invite, viral loops. |
| `system` | Errors, integration failures, diagnostics (does not imply user fault). |

---

## Schema standard (contract)

### Database row shape

| Column | Type | Rules |
|--------|------|--------|
| `event_name` | `text` | **snake_case**, stable (never rename in place; version with suffix if needed). |
| `page` | `text` \| null | Current route pathname (e.g. `/`, `/thank-you`) or logical screen id when no URL (e.g. `modal:ai_tutor`). |
| `metadata` | `jsonb` | Must include **`category`** (enum above). Optional standard keys below. |
| `created_at` | `timestamptz` | Server default; do not send from client except server-side batch jobs. |

### `metadata` standard keys (use when applicable)

| Key | Type | When |
|-----|------|------|
| `category` | `string` | **Required** — one of the seven values above. |
| `location` | `string` | UI placement: `hero`, `final`, `footer`, `thank_you`, etc. |
| `source` | `string` | Campaign or entry: `landing_v8`, UTM source, referrer bucket. |
| `course_id` | `string` | One of: `python`, `sql`, `statistics`, `ml`, `deep-learning`, `genai`, `product-sense`, `system-design`, `mlops`. |
| `lesson_id` | `string` | Stable lesson identifier from course data. |
| `question_id` | `string` | Question id from question bank. |
| `session_id` | `string` | Anonymous session id (generate once per browser session). |
| `reason` | `string` | Error or outcome reason (snake_case), e.g. `invalid_email`, `duplicate_email`. |
| `action` | `string` | Fine-grained verb: `copy_link`, `native_share`, `click`. |

**Privacy:** Never put raw email, name, or free-text PII in `metadata`. Use `email_domain` (derived) only where already established (e.g. waitlist success/error).

### Client helper

Calls must match:

```javascript
await safeLogClientEvent({
  eventName: "<snake_case_event_name>",
  page: "<pathname or logical screen>",
  metadata: { category: "<required>", /* ... */ },
});
```

---

## Event catalog (named + category)

### Implemented (code today)

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `hero_cta_click` | `acquisition` | Primary CTA in hero clicked (starts waitlist flow). |
| `final_cta_click` | `acquisition` | Primary CTA in final section clicked. |
| `footer_link_click` | `acquisition` | Footer link clicked (label/href in metadata). |
| `form_submit_error` | `conversion` or `system` | Waitlist form failed. Use `conversion` for user/business outcomes (`invalid_email`, `duplicate_email`). Use `system` for infra (`missing_supabase_env`, `supabase_insert_failed`). |
| `form_submit_success` | `conversion` | Waitlist row inserted successfully. |
| `thank_you_share_click` | `referral` | Share or copy on thank-you page (`action`: `copy_link` \| `native_share`). |

### Planned — marketing & shell

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `page_view` | `acquisition` | Route viewed (include `route`, optional `referrer_group`). |
| `outbound_link_click` | `acquisition` | Non-footer outbound (href, label). |

### Planned — product (learning & practice)

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `course_view` | `engagement` | Course detail opened (`course_id`). |
| `lesson_start` | `engagement` | Lesson content displayed (`course_id`, `lesson_id`). |
| `lesson_complete` | `conversion` | User marked lesson complete (`course_id`, `lesson_id`). |
| `viz_interaction` | `engagement` | Visualization control used (`viz_id`, `course_id` optional). |
| `question_open` | `engagement` | Question workspace opened (`question_id`, `course_id`). |
| `question_submit` | `conversion` | Answer submitted for evaluation (`question_id`, `type`: `code` \| `open-ended`). |
| `rubric_view` | `engagement` | Model answer / rubric revealed (`question_id`). |

### Planned — AI tutor

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `tutor_open` | `activation` | Tutor panel opened first time in context (`course_id`, `context`: `lesson` \| `question`). |
| `tutor_message_send` | `engagement` | User sent a message (`course_id`, optional `question_id`). |

### Planned — progress & retention

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `session_start` | `retention` | New session boundary (`session_id`). |
| `review_queue_open` | `engagement` | Spaced repetition queue viewed. |
| `milestone_unlock` | `conversion` | Gating milestone passed (define `milestone_id`). |

### Planned — system

| `event_name` | `category` | Description |
|--------------|------------|-------------|
| `client_error` | `system` | Captured exception boundary (`error_code`, `component`). |
| `api_error` | `system` | API route failure from client perspective (`route`, `status`). |

---

## Naming rules

1. **snake_case** for all `event_name` values.  
2. Prefer **verb_noun** or **object_action** consistently (`form_submit_success`, not `SuccessForm`).  
3. Do not change semantics of an existing `event_name`; add a new name and deprecate in docs.  
4. **category** is mandatory in `metadata` for every new event.

---

## Versioning

When breaking changes are unavoidable, introduce `event_name` v2 (e.g. `hero_cta_click_v2`) and keep both during a migration window; document sunset date in `TRACKING-PLAN.md`.

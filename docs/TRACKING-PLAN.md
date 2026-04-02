# DataSpark — Tracking Plan

How we instrument DataSpark end-to-end. **Schema standard:** each logged row has `event_name` (snake_case), `page`, and `metadata` where `metadata.category` is one of: `acquisition` | `activation` | `engagement` | `conversion` | `retention` | `referral` | `system`.

---

## 1. Principles

1. **Non-blocking:** Use `safeLogClientEvent` so analytics never breaks UX.  
2. **Stable contracts:** `event_name` and metadata keys are versioned deliberately (see `EVENT-TAXONOMY.md`).  
3. **Privacy:** No raw PII in `metadata`; use domains, ids, and enums.  
4. **Single session key:** Introduce a client-generated `session_id` (UUID in `sessionStorage`) once the app shell exists; pass in `metadata` for engagement/retention joins.

---

## 2. Implementation map (surface → events)

### Landing & waitlist (shipped)

| User action | `event_name` | `category` | `page` | Key `metadata` |
|-------------|--------------|------------|--------|----------------|
| Hero CTA click | `hero_cta_click` | `acquisition` | `/` | `location`: `hero`, `href` |
| Final CTA click | `final_cta_click` | `acquisition` | `/` | `location`: `final`, `href` |
| Footer link | `footer_link_click` | `acquisition` | `/` | `location`, `label`, `href` |
| Invalid email | `form_submit_error` | `conversion` | `/` | `location`, `reason`: `invalid_email`, `email_domain` |
| Duplicate email | `form_submit_error` | `conversion` | `/` | `reason`: `duplicate_email`, `email_domain`, `supabase_code` |
| DB/env failure | `form_submit_error` | `system` | `/` | `reason`: `supabase_insert_failed` \| `missing_supabase_env`, `supabase_code` optional |
| Success | `form_submit_success` | `conversion` | `/` | `location`, `email_domain` |
| Thank-you share | `thank_you_share_click` | `referral` | `/thank-you` | `action`, `location` |

**Note:** Existing code may omit `category` in metadata until a small follow-up PR adds it everywhere; new events **must** include `category` from day one.

### App shell (planned)

| User action | `event_name` | `category` | `metadata` |
|-------------|--------------|------------|------------|
| Route change | `page_view` | `acquisition` | `route`, optional `referrer_group`, `session_id` |
| Dashboard load | `page_view` | `engagement` | `route`: `/dashboard`, `session_id` |

### Courses & lessons (planned)

| User action | `event_name` | `category` | `metadata` |
|-------------|--------------|------------|------------|
| Open course | `course_view` | `engagement` | `course_id`, `session_id` |
| Start lesson | `lesson_start` | `engagement` | `course_id`, `lesson_id` |
| Complete lesson | `lesson_complete` | `conversion` | `course_id`, `lesson_id` |
| Interact with viz | `viz_interaction` | `engagement` | `viz_id`, `control_id`, `course_id` optional |

### Practice (planned)

| User action | `event_name` | `category` | `metadata` |
|-------------|--------------|------------|------------|
| Open question | `question_open` | `engagement` | `question_id`, `course_id`, `difficulty` optional |
| Submit answer | `question_submit` | `conversion` | `question_id`, `course_id`, `type`, `duration_ms` optional |
| Reveal rubric | `rubric_view` | `engagement` | `question_id` |

### AI tutor (planned)

| User action | `event_name` | `category` | `metadata` |
|-------------|--------------|------------|------------|
| Open tutor | `tutor_open` | `activation` | `course_id`, `context`, `question_id` optional |
| Send message | `tutor_message_send` | `engagement` | `course_id`, `message_index` optional |

### Retention (planned)

| User action | `event_name` | `category` | `metadata` |
|-------------|--------------|------------|------------|
| New session | `session_start` | `retention` | `session_id`, `days_since_last` optional |
| Open review | `review_queue_open` | `engagement` | `queue_depth` optional |

---

## 3. Server-side & future

- **Waitlist insert** is already persisted in `waitlist_signups`; do not duplicate as a second event unless product needs a server-only audit stream.  
- **API routes** (AI chat, evaluation): log `api_error` on failure (`system`) with non-PII codes; success paths can stay silent unless funnel requires `conversion` server events.  
- **Batch identity:** When auth exists, add `user_id` only in server-side or secure contexts—not in public anon metadata unless policy allows.

---

## 4. Rollout checklist

1. Add `category` to all existing client `metadata` objects.  
2. Add `session_id` helper in `src/lib/analytics.js` and thread into high-volume events.  
3. Backfill is **not** required for historical rows missing `category`; analysis filters “category present.”  
4. Update this table when adding any new `event_name`.

---

## 5. Ownership

- **Product / growth:** owns funnel definitions (`FUNNEL-DEFINITIONS.md`) and naming.  
- **Engineering:** implements logging and guards PII.  
- **Review:** any new `event_name` is reviewed with `EVENT-TAXONOMY.md` in the same PR.

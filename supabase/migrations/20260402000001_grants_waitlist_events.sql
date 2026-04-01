-- Ensure anon/authenticated roles can INSERT (RLS policies still apply).
-- Run after 20260402000000_waitlist_and_events.sql if inserts fail with permission/RLS-like errors.

grant usage on schema public to anon, authenticated;

grant insert on table public.waitlist_signups to anon, authenticated;
grant insert on table public.event_logs to anon, authenticated;

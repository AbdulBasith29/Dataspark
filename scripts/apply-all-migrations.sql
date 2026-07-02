-- DataSpark: all migrations in order, for one-time paste into the Supabase SQL editor.
-- Generated from supabase/migrations/ — run once on a fresh project.

-- ═══════════ supabase/migrations/20260402000000_waitlist_and_events.sql ═══════════
-- DataSpark waitlist + funnel event logging
-- Run in Supabase SQL editor or via `supabase db push` (if using Supabase CLI).

create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_unique unique (email)
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists event_logs_event_name_created_at_idx
  on public.event_logs (event_name, created_at desc);

alter table public.waitlist_signups enable row level security;
alter table public.event_logs enable row level security;

-- Public waitlist capture (anon key) + append-only event logging.
drop policy if exists "Allow public insert waitlist signups" on public.waitlist_signups;
create policy "Allow public insert waitlist signups"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public insert event logs" on public.event_logs;
create policy "Allow public insert event logs"
  on public.event_logs
  for insert
  to anon, authenticated
  with check (true);

-- Optional: keep reads server-side only (no select policies for anon/authenticated).

-- ═══════════ supabase/migrations/20260402000001_grants_waitlist_events.sql ═══════════
-- Ensure anon/authenticated roles can INSERT (RLS policies still apply).
-- Run after 20260402000000_waitlist_and_events.sql if inserts fail with permission/RLS-like errors.

grant usage on schema public to anon, authenticated;

grant insert on table public.waitlist_signups to anon, authenticated;
grant insert on table public.event_logs to anon, authenticated;

-- ═══════════ supabase/migrations/20260611000000_profiles.sql ═══════════
-- =============================================================================
-- DataSpark · Auth profiles
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- 1. Profiles table — one row per authenticated user
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Row-level security — users can only see and edit their own row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: owner select" ON public.profiles;
CREATE POLICY "profiles: owner select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: owner update" ON public.profiles;
CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Keep updated_at current on any profile change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

-- ═══════════ supabase/migrations/20260611000001_chatbot_usage.sql ═══════════
-- =============================================================================
-- DataSpark · Chatbot usage tracking (daily rate limiting)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chatbot_usage (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER     NOT NULL DEFAULT 0,
  CONSTRAINT chatbot_usage_user_date_unique UNIQUE (user_id, date)
);

ALTER TABLE public.chatbot_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage (for showing the counter in the UI)
DROP POLICY IF EXISTS "chatbot_usage: owner select" ON public.chatbot_usage;
CREATE POLICY "chatbot_usage: owner select"
  ON public.chatbot_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS chatbot_usage_user_date_idx
  ON public.chatbot_usage (user_id, date DESC);

-- Grants (service role bypasses RLS anyway, but good practice)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.chatbot_usage TO authenticated;

-- ═══════════ supabase/migrations/20260611000002_early_access_signups.sql ═══════════
-- Early access / waitlist email capture
create table if not exists public.early_access_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  created_at  timestamptz not null default now(),
  constraint early_access_signups_email_unique unique (email)
);

-- Enable Row Level Security
alter table public.early_access_signups enable row level security;

-- Anyone (including anonymous visitors) can insert their email
create policy "anon_insert" on public.early_access_signups
  for insert to anon, authenticated
  with check (true);

-- Only the service role (admin) can read the list
create policy "service_select" on public.early_access_signups
  for select to service_role
  using (true);

-- Index for fast lookups / dedup
create index if not exists early_access_signups_email_idx
  on public.early_access_signups (lower(email));

-- ═══════════ supabase/migrations/20260616000000_lesson_progress.sql ═══════════
-- Lesson completion tracking, per account
create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    text not null,
  status       text not null default 'done',
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "owner_select" on public.lesson_progress
  for select to authenticated using (auth.uid() = user_id);

create policy "owner_insert" on public.lesson_progress
  for insert to authenticated with check (auth.uid() = user_id);

create policy "owner_update" on public.lesson_progress
  for update to authenticated using (auth.uid() = user_id);

create index if not exists lesson_progress_user_idx on public.lesson_progress (user_id);

-- ═══════════ supabase/migrations/20260616000001_chat_messages.sql ═══════════
-- AI tutor conversation history, per account + course
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  text not null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "owner_select" on public.chat_messages
  for select to authenticated using (auth.uid() = user_id);

create policy "owner_insert" on public.chat_messages
  for insert to authenticated with check (auth.uid() = user_id);

create index if not exists chat_messages_user_course_idx
  on public.chat_messages (user_id, course_id, created_at);

-- ═══════════ supabase/migrations/20260616000002_user_subscriptions.sql ═══════════
-- Per-account subscription state, synced from Stripe via webhook.
-- Source of truth for plan gating is `plan` + `status`; the webhook
-- (running with the service role) is the only writer.
create table if not exists public.user_subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan                   text not null default 'free' check (plan in ('free','pro')),
  status                 text not null default 'inactive',
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- Users may read their own subscription row. They may NOT write it —
-- all writes happen server-side through the Stripe webhook with the
-- service-role key, which bypasses RLS.
create policy "owner_select" on public.user_subscriptions
  for select to authenticated using (auth.uid() = user_id);

create index if not exists user_subscriptions_customer_idx
  on public.user_subscriptions (stripe_customer_id);

-- ═══════════ supabase/migrations/20260702000000_question_progress_and_certificates.sql ═══════════
-- Practice-question completion per account + verifiable course certificates.

-- ── question_progress: best score per (user, question) ──────────────────────
create table if not exists public.question_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  text not null,
  score        int,
  completed_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_progress enable row level security;

create policy "owner_select" on public.question_progress
  for select to authenticated using (auth.uid() = user_id);

create policy "owner_insert" on public.question_progress
  for insert to authenticated with check (auth.uid() = user_id);

create policy "owner_update" on public.question_progress
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists question_progress_user_idx
  on public.question_progress (user_id);

-- ── certificates: server-issued, verifiable credentials ─────────────────────
-- Issued ONLY by api/certificates (service role) after checking the lesson is
-- actually completed; verified through the same API by credential id. Owners
-- can read their own rows; there is deliberately no public SELECT policy so
-- the table can't be enumerated for recipient names.
create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  lesson_id      text not null,
  course_id      text not null,
  title          text not null,
  recipient_name text not null,
  dimensions     jsonb not null default '[]',
  issued_at      timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.certificates enable row level security;

create policy "owner_select" on public.certificates
  for select to authenticated using (auth.uid() = user_id);


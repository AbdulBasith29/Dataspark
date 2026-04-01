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

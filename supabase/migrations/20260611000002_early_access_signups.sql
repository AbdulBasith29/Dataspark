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

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

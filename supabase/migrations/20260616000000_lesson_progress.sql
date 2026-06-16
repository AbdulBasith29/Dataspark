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

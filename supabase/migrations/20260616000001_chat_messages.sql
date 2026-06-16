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

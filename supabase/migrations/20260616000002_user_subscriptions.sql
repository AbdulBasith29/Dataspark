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

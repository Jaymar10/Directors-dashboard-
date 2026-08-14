-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run

create table dashboard_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table dashboard_state enable row level security;

-- These policies allow the app's public anon key to read/write.
-- Access to the dashboard itself is gated separately by Vercel's
-- deployment password (see DEPLOY.md) — treat that password as the
-- real lock, not this table.
create policy "anon can read state" on dashboard_state
  for select using (true);

create policy "anon can insert state" on dashboard_state
  for insert with check (true);

create policy "anon can update state" on dashboard_state
  for update using (true);

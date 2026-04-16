create extension if not exists "uuid-ossp";

create table if not exists public.hexagram_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null,
  shichen text not null,
  date_str text not null,
  input text not null default '',
  ben_name text not null,
  chg_name text not null,
  div_code text not null,
  chg_code text not null,
  chgsum integer not null,
  results jsonb not null,
  names jsonb not null,
  lines jsonb not null,
  source text not null default 'auto',
  source_label text not null default 'current',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_hexagram_unique
  on public.hexagram_history(user_id, timestamp);

create index if not exists idx_hexagram_user_ts
  on public.hexagram_history(user_id, timestamp desc);

alter table public.hexagram_history enable row level security;

drop policy if exists "view_own" on public.hexagram_history;
create policy "view_own"
  on public.hexagram_history
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "insert_own" on public.hexagram_history;
create policy "insert_own"
  on public.hexagram_history
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "update_own" on public.hexagram_history;
create policy "update_own"
  on public.hexagram_history
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "delete_own" on public.hexagram_history;
create policy "delete_own"
  on public.hexagram_history
  for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

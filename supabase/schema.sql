-- PitWall — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) to set up user profiles.

-- 1) Profiles table: one row per auth user, holds the PRO flag.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_pro boolean not null default false,
  race_notifications boolean not null default false,
  lemon_squeezy_customer_id text,
  updated_at timestamptz not null default now()
);

-- If the table already exists from an earlier version, add the new column.
alter table public.profiles
  add column if not exists race_notifications boolean not null default false;

-- 2) Row Level Security: a user can read/update only their own profile.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- Column-level hardening. RLS gates *rows*, not columns: without this a signed-in
-- user could update any column of their own row — including is_pro — and grant
-- themselves PRO for free. Restrict authenticated users to updating ONLY the
-- notification preference. Billing fields (is_pro, lemon_squeezy_customer_id)
-- stay writable solely by the service role (used by the Lemon Squeezy webhook),
-- which bypasses these grants.
revoke update on public.profiles from anon, authenticated;
grant update (race_notifications) on public.profiles to authenticated;

-- 3) Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();

-- 4) Season standings cache: one JSON blob per season so pages read persisted
--    standings instantly instead of re-aggregating OpenF1 on a cold cache.
create table if not exists public.season_cache (
  year int primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.season_cache enable row level security;

-- F1 data is public, so anyone may read it. Writes happen only via the
-- service-role key (which bypasses RLS) from the server / refresh endpoint.
drop policy if exists "Season cache is public" on public.season_cache;
create policy "Season cache is public"
  on public.season_cache for select
  using (true);

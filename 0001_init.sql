-- Habit Rabbit — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. profiles  (one per auth user, holds role + preferences)
-- ─────────────────────────────────────────────────────────────
create type public.user_role as enum ('user', 'moderator', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  timezone text not null default 'UTC',
  -- consent flags: nothing is shown publicly without the user's say-so
  share_weekly_report boolean not null default false,
  notify_reminders boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile whenever someone signs in with Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. habits  (the user's own to-dos, repeatable per weekday)
-- ─────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  notes text check (char_length(notes) <= 500),
  emoji text not null default '🥕',
  -- which weekdays it appears on: 0 = Sunday … 6 = Saturday
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}',
  color text not null default 'primary',
  archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_idx on public.habits (user_id) where archived = false;

-- ─────────────────────────────────────────────────────────────
-- 3. habit_logs  (one row per habit per day it was checked off)
-- ─────────────────────────────────────────────────────────────
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null default current_date,
  completed boolean not null default true,
  note text check (char_length(note) <= 280),
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date desc);

-- ─────────────────────────────────────────────────────────────
-- 4. notifications
-- ─────────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'info' check (kind in ('info', 'celebrate', 'report', 'system')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 5. contact_messages
-- ─────────────────────────────────────────────────────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (position('@' in email) > 1),
  subject text not null check (char_length(subject) between 1 and 140),
  message text not null check (char_length(message) between 1 and 2000),
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 6. weekly_reports  (generated only when the user asks for one)
-- ─────────────────────────────────────────────────────────────
create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  completed_count int not null default 0,
  planned_count int not null default 0,
  summary text not null default '',
  consent_public boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.weekly_reports enable row level security;

-- helper: is the caller an admin/moderator?
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'moderator')
  );
$$;

-- profiles
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id or public.is_staff());
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: staff update role" on public.profiles
  for update using (public.is_staff());

-- habits
create policy "habits: owner all" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits: staff read" on public.habits
  for select using (public.is_staff());

-- habit_logs
create policy "logs: owner all" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "logs: staff read" on public.habit_logs
  for select using (public.is_staff());

-- notifications
create policy "notifications: owner all" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- contact messages: anyone may write, staff may read
create policy "contact: insert any" on public.contact_messages
  for insert with check (true);
create policy "contact: staff read" on public.contact_messages
  for select using (public.is_staff());
create policy "contact: staff update" on public.contact_messages
  for update using (public.is_staff());

-- weekly reports: owner full, staff read, and opted-in reports readable by their owner only
create policy "reports: owner all" on public.weekly_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports: staff read" on public.weekly_reports
  for select using (public.is_staff());

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger habits_touch before update on public.habits
for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

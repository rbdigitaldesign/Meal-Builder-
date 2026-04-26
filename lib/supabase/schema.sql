-- ============================================================
-- Alchemy Natural Health — Meal Builder Schema
-- Run this in Supabase SQL Editor to set up the database.
-- ============================================================

-- CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  pin text unique,
  restrictions text[] not null default '{}',
  targets jsonb not null default '[]',
  condition_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  last_active timestamptz
);

-- MEAL LOGS
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, date, meal_type)
);

-- CLINICAL NOTES
create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CONDITION TEMPLATES
create table public.condition_templates (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  restrictions text[] not null default '{}',
  targets jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table public.clients enable row level security;
alter table public.meal_logs enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.condition_templates enable row level security;

-- Any user with role=practitioner in app_metadata can manage all clients
create policy "practitioners_manage_clients" on public.clients
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'practitioner');

create policy "practitioners_view_meal_logs" on public.meal_logs
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'practitioner');

create policy "practitioners_manage_notes" on public.clinical_notes
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'practitioner');

create policy "practitioners_manage_templates" on public.condition_templates
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'practitioner');

-- ── DEFAULT CONDITION TEMPLATES ──────────────────────────────────
-- Note: Insert these after Kelly signs up — replace '00000000-...' with her auth.uid()
-- You can run: select auth.uid(); after signing in to get the value.

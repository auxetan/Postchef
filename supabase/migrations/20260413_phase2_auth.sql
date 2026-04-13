-- PostChef — Phase 2
-- Authentification, persistance utilisateur et policies RLS

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  first_name text not null default '',
  plan text not null default 'starter' check (plan in ('starter', 'pro_monthly', 'pro_annual', 'premium')),
  plan_expiry timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.restaurants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  city text not null default '',
  cuisine_types text[] not null default '{}',
  specialite text not null default '',
  couverts text not null default '20-50',
  client_profiles text[] not null default '{}',
  objective text not null default '',
  platforms text[] not null default '{}',
  frequency text not null default '2-3/sem',
  styles text[] not null default '{}',
  onboarding_step integer not null default 1,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usage jsonb not null default '{}'::jsonb,
  posts jsonb not null default '[]'::jsonb,
  ideas jsonb not null default '[]'::jsonb,
  saved_ideas jsonb not null default '[]'::jsonb,
  reels jsonb not null default '[]'::jsonb,
  brand_kit jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at
before update on public.restaurants
for each row
execute function public.set_updated_at();

drop trigger if exists set_app_state_updated_at on public.app_state;
create trigger set_app_state_updated_at
before update on public.app_state
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, first_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', '')
  )
  on conflict (user_id) do nothing;

  insert into public.restaurants (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.app_state (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.app_state enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "restaurants_select_own" on public.restaurants;
create policy "restaurants_select_own"
on public.restaurants
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "restaurants_insert_own" on public.restaurants;
create policy "restaurants_insert_own"
on public.restaurants
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "restaurants_update_own" on public.restaurants;
create policy "restaurants_update_own"
on public.restaurants
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "app_state_select_own" on public.app_state;
create policy "app_state_select_own"
on public.app_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "app_state_insert_own" on public.app_state;
create policy "app_state_insert_own"
on public.app_state
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "app_state_update_own" on public.app_state;
create policy "app_state_update_own"
on public.app_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

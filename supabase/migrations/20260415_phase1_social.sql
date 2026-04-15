-- PostChef — Phase 1 : Publication réseaux sociaux
-- Tables : social_connections, scheduled_posts

-- ── social_connections ──────────────────────────────────────────────────────
-- Stocke les comptes réseaux liés par utilisateur via Ayrshare
create table if not exists public.social_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  platform        text not null check (platform in ('instagram', 'tiktok', 'facebook')),
  ayrshare_profile_key text not null default '',
  display_name    text not null default '',
  connected_at    timestamptz not null default timezone('utc', now()),
  status          text not null default 'connected'
                  check (status in ('connected', 'disconnected', 'error')),
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  unique (user_id, platform)
);

-- ── scheduled_posts ─────────────────────────────────────────────────────────
-- Posts programmés en attente de publication via Ayrshare
create table if not exists public.scheduled_posts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  post_id               text not null,          -- ID du post dans app_state.posts
  platforms             text[] not null default '{}',
  media_url             text,                   -- URL vidéo/photo rendue (Shotstack ou upload)
  caption               text not null default '',
  scheduled_at          timestamptz not null,
  ayrshare_scheduled_id text,                   -- ID retourné par Ayrshare
  status                text not null default 'scheduled'
                        check (status in ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  error_message         text,
  published_at          timestamptz,
  created_at            timestamptz not null default timezone('utc', now()),
  updated_at            timestamptz not null default timezone('utc', now())
);

-- ── Ayrshare profile key par utilisateur ────────────────────────────────────
-- Stocké dans profiles pour éviter une jointure
alter table public.profiles
  add column if not exists ayrshare_profile_key text not null default '';

-- ── Triggers updated_at ─────────────────────────────────────────────────────
drop trigger if exists set_social_connections_updated_at on public.social_connections;
create trigger set_social_connections_updated_at
before update on public.social_connections
for each row execute function public.set_updated_at();

drop trigger if exists set_scheduled_posts_updated_at on public.scheduled_posts;
create trigger set_scheduled_posts_updated_at
before update on public.scheduled_posts
for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.social_connections enable row level security;
alter table public.scheduled_posts    enable row level security;

drop policy if exists "social_connections_select_own" on public.social_connections;
create policy "social_connections_select_own" on public.social_connections
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "social_connections_insert_own" on public.social_connections;
create policy "social_connections_insert_own" on public.social_connections
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "social_connections_update_own" on public.social_connections;
create policy "social_connections_update_own" on public.social_connections
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "social_connections_delete_own" on public.social_connections;
create policy "social_connections_delete_own" on public.social_connections
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "scheduled_posts_select_own" on public.scheduled_posts;
create policy "scheduled_posts_select_own" on public.scheduled_posts
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "scheduled_posts_insert_own" on public.scheduled_posts;
create policy "scheduled_posts_insert_own" on public.scheduled_posts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "scheduled_posts_update_own" on public.scheduled_posts;
create policy "scheduled_posts_update_own" on public.scheduled_posts
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "scheduled_posts_delete_own" on public.scheduled_posts;
create policy "scheduled_posts_delete_own" on public.scheduled_posts
  for delete to authenticated using (auth.uid() = user_id);

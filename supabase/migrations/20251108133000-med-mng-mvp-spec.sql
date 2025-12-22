-- Align Med-MNG schema with MVP specification

-- Specialties
create table if not exists public.specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  color text default '#3B82F6',
  icon text default 'stethoscope',
  item_count integer default 0,
  created_at timestamptz default now()
);

-- Items adjustments
alter table public.items add column if not exists type text;
alter table public.items add column if not exists specialty_id uuid references public.specialties(id);
alter table public.items add column if not exists rang text;
alter table public.items add column if not exists description text;
alter table public.items add column if not exists objectives jsonb default '[]';
alter table public.items add column if not exists keywords text[];
alter table public.items add column if not exists difficulty integer default 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'items' AND constraint_name = 'items_type_check'
  ) THEN
    EXECUTE 'alter table public.items add constraint items_type_check check (type in (''EDN'', ''ECOS'', ''SD'')) not valid';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'items' AND constraint_name = 'items_rang_check'
  ) THEN
    EXECUTE 'alter table public.items add constraint items_rang_check check (rang in (''A'', ''B'', ''AB'')) not valid';
  END IF;
END $$;

create index if not exists idx_items_code on public.items(code);
create index if not exists idx_items_type on public.items(type);
create index if not exists idx_items_specialty on public.items(specialty_id);
create index if not exists idx_items_keywords on public.items using gin(keywords);

-- Rename item_type -> type when needed (only if type doesn't already exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'item_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'type'
  ) THEN
    EXECUTE 'alter table public.items rename column item_type to type';
  END IF;
END $$;

-- Fiches & sources
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  type text check (type in ('college', 'reference', 'cours', 'video')),
  year integer,
  created_at timestamptz default now()
);

create table if not exists public.fiches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade,
  title text not null,
  content jsonb not null,
  type text check (type in ('text', 'table', 'list', 'mixed')),
  position integer default 0,
  source_id uuid references public.sources(id),
  rang text check (rang in ('A', 'B', 'AB')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_fiches_item on public.fiches(item_id);

-- Audios adjustments
alter table public.audios add column if not exists rang text;
alter table public.audios add column if not exists url text;
alter table public.audios add column if not exists stream_url text;
alter table public.audios add column if not exists duration integer;
alter table public.audios add column if not exists bpm integer;
alter table public.audios add column if not exists style text;
alter table public.audios add column if not exists lyrics text;
alter table public.audios add column if not exists suno_id text;
alter table public.audios add column if not exists generation_model text;
alter table public.audios add column if not exists metadata jsonb default '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audios' AND column_name = 'audio_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audios' AND column_name = 'url'
  ) THEN
    EXECUTE 'alter table public.audios rename column audio_url to url';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audios' AND column_name = 'duration_seconds'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audios' AND column_name = 'duration'
  ) THEN
    EXECUTE 'alter table public.audios rename column duration_seconds to duration';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'audios' AND constraint_name = 'audios_rang_check'
  ) THEN
    EXECUTE 'alter table public.audios add constraint audios_rang_check check (rang in (''A'', ''B'', ''AB'')) not valid';
  END IF;
END $$;

create index if not exists idx_audios_item on public.audios(item_id);
create index if not exists idx_audios_rang on public.audios(rang);

-- Tags adjustments
alter table public.tags add column if not exists category text;
alter table public.tags add column if not exists color text default '#6B7280';

-- Profiles extensions
alter table public.profiles add column if not exists streak_current integer default 0;
alter table public.profiles add column if not exists streak_best integer default 0;
alter table public.profiles add column if not exists last_study_date date;
alter table public.profiles add column if not exists weekly_goal integer default 10;
alter table public.profiles add column if not exists total_items_revised integer default 0;
alter table public.profiles add column if not exists total_time_spent integer default 0;

-- User progress adjustments
alter table public.user_progress add column if not exists id uuid default gen_random_uuid();
alter table public.user_progress add column if not exists last_seen_at timestamptz default now();
alter table public.user_progress add column if not exists revision_count integer default 0;
alter table public.user_progress add column if not exists score integer default 0;
alter table public.user_progress add column if not exists time_spent integer default 0;
alter table public.user_progress add column if not exists notes text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'last_opened_at'
  ) THEN
    EXECUTE 'alter table public.user_progress rename column last_opened_at to last_seen_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'streak'
  ) THEN
    EXECUTE 'alter table public.user_progress drop column streak';
  END IF;
END $$;

-- Migrate old status values to new values
update public.user_progress
set status = case
  when status = 'todo' then 'not_started'
  when status = 'done' then 'revised'
  else status
end
where status in ('todo', 'done');

-- Ensure all existing rows have a UUID before changing primary key
update public.user_progress
  set id = gen_random_uuid()
  where id is null;

alter table public.user_progress
  alter column id set not null;

DO $$
DECLARE
  pk_name text;
BEGIN
  -- Check if a primary key exists and drop it
  SELECT constraint_name
  INTO pk_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'user_progress'
    AND constraint_type = 'PRIMARY KEY'
  LIMIT 1;

  IF pk_name IS NOT NULL THEN
    EXECUTE format(
      'alter table public.user_progress drop constraint %I',
      pk_name
    );
  END IF;
END $$;

alter table public.user_progress add primary key (id);
create unique index if not exists user_progress_user_item_unique on public.user_progress(user_id, item_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND constraint_name = 'user_progress_status_check'
  ) THEN
    EXECUTE 'alter table public.user_progress drop constraint user_progress_status_check';
  END IF;
END $$;

alter table public.user_progress
  add constraint user_progress_status_check check (status in ('not_started', 'in_progress', 'revised'));

create index if not exists idx_progress_user on public.user_progress(user_id);
create index if not exists idx_progress_status on public.user_progress(status);
create index if not exists idx_progress_user_status on public.user_progress(user_id, status);

-- Favorites adjustments
DO $$
DECLARE
  v_has_user_id boolean;
  v_has_item_id boolean;
  v_has_pk      boolean;
  pk_name       text;
BEGIN
  -- If the favorites table does not exist, skip adjustments.
  IF to_regclass('public.favorites') IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'favorites'
      AND column_name  = 'user_id'
  ) INTO v_has_user_id;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'favorites'
      AND column_name  = 'item_id'
  ) INTO v_has_item_id;

  -- Ensure the id column exists.
  EXECUTE 'alter table public.favorites add column if not exists id uuid default gen_random_uuid()';

  -- Ensure all existing favorites rows have a UUID before adding the primary key
  EXECUTE 'update public.favorites set id = gen_random_uuid() where id is null';
  
  EXECUTE 'alter table public.favorites alter column id set not null';

  -- Check if a primary key already exists on favorites.
  SELECT constraint_name
  INTO pk_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'favorites'
    AND constraint_type = 'PRIMARY KEY'
  LIMIT 1;

  -- Drop existing primary key if present (to allow changing it to id).
  IF pk_name IS NOT NULL THEN
    EXECUTE format('alter table public.favorites drop constraint %I', pk_name);
  END IF;

  -- Add primary key on id
  EXECUTE 'alter table public.favorites add primary key (id)';

  -- Only create the unique index if user_id and item_id both exist.
  IF v_has_user_id AND v_has_item_id THEN
    EXECUTE 'create unique index if not exists favorites_user_item_unique on public.favorites(user_id, item_id)';
  END IF;

  -- Create user_id index only if user_id exists.
  IF v_has_user_id THEN
    EXECUTE 'create index if not exists idx_favorites_user on public.favorites(user_id)';
  END IF;
END $$;

-- Playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default false,
  item_count integer default 0,
  total_duration integer default 0,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_playlists_user on public.playlists(user_id);

create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references public.playlists(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  audio_id uuid references public.audios(id),
  position integer not null,
  added_at timestamptz default now(),
  unique(playlist_id, item_id)
);

create index if not exists idx_playlist_items_playlist on public.playlist_items(playlist_id);

-- Study sessions
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null default current_date,
  items_revised integer default 0,
  time_spent integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists idx_sessions_user_date on public.study_sessions(user_id, date);

-- RLS
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.study_sessions enable row level security;

create policy "Users can view own/public playlists" on public.playlists
  for select using (auth.uid() = user_id or is_public = true);
create policy "Users can manage own playlists" on public.playlists
  for all using (auth.uid() = user_id);

create policy "Users can manage own playlist items" on public.playlist_items
  for all using (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_items.playlist_id
      and playlists.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_items.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can manage own sessions" on public.study_sessions
  for all using (auth.uid() = user_id);

-- Functions & triggers
create or replace function public.update_user_streak()
returns trigger as $$
declare
  last_date date;
  current_streak integer;
begin
  select last_study_date, streak_current into last_date, current_streak
  from public.profiles where id = new.user_id;

  if last_date is null or last_date < current_date - 1 then
    update public.profiles set
      streak_current = 1,
      last_study_date = current_date
    where id = new.user_id;
  elsif last_date = current_date - 1 then
    update public.profiles set
      streak_current = streak_current + 1,
      streak_best = greatest(streak_best, streak_current + 1),
      last_study_date = current_date
    where id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger on_study_session_insert
  after insert on public.study_sessions
  for each row execute function public.update_user_streak();

create or replace function public.update_playlist_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.playlists set item_count = item_count + 1 where id = new.playlist_id;
  elsif tg_op = 'DELETE' then
    update public.playlists set item_count = item_count - 1 where id = old.playlist_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_playlist_item_change
  after insert or delete on public.playlist_items
  for each row execute function public.update_playlist_count();

create or replace function public.get_user_progress_stats(p_user_id uuid)
returns table (
  total_items bigint,
  revised_items bigint,
  in_progress_items bigint,
  completion_percentage numeric
) as $$
begin
  return query
  select
    count(distinct i.id) as total_items,
    count(distinct case when up.status = 'revised' then up.item_id end) as revised_items,
    count(distinct case when up.status = 'in_progress' then up.item_id end) as in_progress_items,
    round(
      count(distinct case when up.status = 'revised' then up.item_id end)::numeric /
      nullif(count(distinct i.id), 0) * 100,
      1
    ) as completion_percentage
  from public.items i
  left join public.user_progress up on i.id = up.item_id and up.user_id = p_user_id;
end;
$$ language plpgsql;

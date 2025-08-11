-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- 1) Versioned lyrics table
create table if not exists public.lyrics_texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  edn_item_slug text not null,
  content text not null,
  version integer not null default 1,
  is_current boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Optional link to a generated job result
  source_job_id uuid null,
  constraint lyrics_texts_version_unique unique (user_id, edn_item_slug, version)
);

-- Partial unique index: only one current per (user, item)
create unique index if not exists lyrics_texts_one_current_per_item_user
  on public.lyrics_texts(user_id, edn_item_slug)
  where is_current;

-- Helpful indexes
create index if not exists lyrics_texts_user_idx on public.lyrics_texts(user_id);
create index if not exists lyrics_texts_slug_idx on public.lyrics_texts(edn_item_slug);
create index if not exists lyrics_texts_current_idx on public.lyrics_texts(is_current);

-- Auto-update updated_at trigger
create trigger lyrics_texts_set_updated_at
before update on public.lyrics_texts
for each row execute function public.handle_updated_at();

-- Function: auto-version and ensure only one current per (user, item)
create or replace function public.lyrics_texts_before_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- If an existing current version exists for this user/item, increment version and demote old current
  declare last_version integer;
  begin
    select max(version) into last_version
    from public.lyrics_texts
    where user_id = new.user_id and edn_item_slug = new.edn_item_slug;

    if last_version is not null then
      if new.version is null or new.version <= last_version then
        new.version := last_version + 1;
      end if;

      -- Demote previous current to false
      update public.lyrics_texts
      set is_current = false, updated_at = now()
      where user_id = new.user_id
        and edn_item_slug = new.edn_item_slug
        and is_current = true;
    else
      -- First version for this item/user
      new.version := coalesce(new.version, 1);
      new.is_current := coalesce(new.is_current, true);
    end if;

    return new;
  exception when others then
    -- In case of race conditions, let unique index handle conflicts
    return new;
  end;
end;
$$;

create trigger lyrics_texts_bi
before insert on public.lyrics_texts
for each row execute function public.lyrics_texts_before_insert();

-- Enable RLS and secure policies
alter table public.lyrics_texts enable row level security;

-- Owner-only access policies
create policy if not exists "lyrics_select_own" on public.lyrics_texts
for select using (auth.uid() = user_id);

create policy if not exists "lyrics_insert_own" on public.lyrics_texts
for insert with check (auth.uid() = user_id);

create policy if not exists "lyrics_update_own" on public.lyrics_texts
for update using (auth.uid() = user_id);

create policy if not exists "lyrics_delete_own" on public.lyrics_texts
for delete using (auth.uid() = user_id);


-- 2) Lyrics generation jobs table
create table if not exists public.lyrics_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  edn_item_slug text,
  prompt text,
  params jsonb default '{}'::jsonb,
  status text not null default 'queued',
  error text,
  result_lyrics_id uuid references public.lyrics_texts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint lyrics_generation_status_check check (status in ('queued','running','succeeded','failed','canceled'))
);

create index if not exists lyrics_jobs_user_idx on public.lyrics_generation_jobs(user_id);
create index if not exists lyrics_jobs_slug_idx on public.lyrics_generation_jobs(edn_item_slug);
create index if not exists lyrics_jobs_status_idx on public.lyrics_generation_jobs(status);

create trigger lyrics_jobs_set_updated_at
before update on public.lyrics_generation_jobs
for each row execute function public.handle_updated_at();

alter table public.lyrics_generation_jobs enable row level security;

create policy if not exists "lyrics_jobs_select_own" on public.lyrics_generation_jobs
for select using (auth.uid() = user_id);

create policy if not exists "lyrics_jobs_insert_own" on public.lyrics_generation_jobs
for insert with check (auth.uid() = user_id);

create policy if not exists "lyrics_jobs_update_own" on public.lyrics_generation_jobs
for update using (auth.uid() = user_id);

create policy if not exists "lyrics_jobs_delete_own" on public.lyrics_generation_jobs
for delete using (auth.uid() = user_id);

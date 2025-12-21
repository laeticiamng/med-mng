-- Med-MNG MVP: Items, notes, audios, tags, progress, favorites

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  specialty text,
  item_type text not null check (item_type in ('EDN', 'ECOS', 'SD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_notes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audios (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  title text not null,
  audio_url text not null,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, tag_id)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  last_opened_at timestamptz,
  streak integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index if not exists user_progress_status_idx on public.user_progress (user_id, status);
create index if not exists item_notes_item_id_idx on public.item_notes (item_id);
create index if not exists audios_item_id_idx on public.audios (item_id);

-- Updated_at triggers
create trigger update_items_updated_at
before update on public.items
for each row execute function public.handle_updated_at();

create trigger update_item_notes_updated_at
before update on public.item_notes
for each row execute function public.handle_updated_at();

create trigger update_user_progress_updated_at
before update on public.user_progress
for each row execute function public.handle_updated_at();

-- RLS
alter table public.items enable row level security;
alter table public.item_notes enable row level security;
alter table public.audios enable row level security;
alter table public.tags enable row level security;
alter table public.item_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.user_progress enable row level security;

create policy "items_read_all" on public.items
for select using (true);

create policy "item_notes_read_all" on public.item_notes
for select using (true);

create policy "audios_read_all" on public.audios
for select using (true);

create policy "tags_read_all" on public.tags
for select using (true);

create policy "item_tags_read_all" on public.item_tags
for select using (true);

create policy "favorites_read_own" on public.favorites
for select using (auth.uid() = user_id);

create policy "favorites_write_own" on public.favorites
for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
for delete using (auth.uid() = user_id);

create policy "user_progress_read_own" on public.user_progress
for select using (auth.uid() = user_id);

create policy "user_progress_write_own" on public.user_progress
for insert with check (auth.uid() = user_id);

create policy "user_progress_update_own" on public.user_progress
for update using (auth.uid() = user_id);

create policy "user_progress_delete_own" on public.user_progress
for delete using (auth.uid() = user_id);

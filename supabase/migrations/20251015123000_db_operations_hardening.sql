-- Hardening indexes, uniqueness and service policies for library & analytics tables
set search_path = public;

-- Guarantee only one default collection per user without breaking idempotency
create unique index if not exists content_library_collections_single_default
  on public.content_library_collections(user_id)
  where is_default;

-- Speed up favourite toggles and collection lookups in the unified library
create index if not exists idx_content_library_items_favorites
  on public.content_library_items(user_id)
  where is_favorite;

create index if not exists idx_content_library_collection_items_library
  on public.content_library_collection_items(library_item_id);

-- Ensure analytics retention sweeps can quickly target events per pseudonymised user
create index if not exists idx_analytics_events_pseudo_time
  on public.analytics_events(pseudonymized_user_id, occurred_at desc);

-- Prevent blank resource identifiers in the library catalog
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'content_library_items_resource_identifier_not_blank'
  ) then
    alter table public.content_library_items
      add constraint content_library_items_resource_identifier_not_blank
        check (char_length(btrim(resource_identifier)) > 0);
  end if;
end $$;

-- Service role full access policies to unblock maintenance jobs while keeping RLS for end-users
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_library_items'
      and policyname = 'content_library_items_service_role_manage'
  ) then
    create policy "content_library_items_service_role_manage"
      on public.content_library_items
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_library_collections'
      and policyname = 'content_library_collections_service_role_manage'
  ) then
    create policy "content_library_collections_service_role_manage"
      on public.content_library_collections
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_library_collection_items'
      and policyname = 'content_library_collection_items_service_role_manage'
  ) then
    create policy "content_library_collection_items_service_role_manage"
      on public.content_library_collection_items
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'study_notes'
      and policyname = 'study_notes_service_role_manage'
  ) then
    create policy "study_notes_service_role_manage"
      on public.study_notes
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

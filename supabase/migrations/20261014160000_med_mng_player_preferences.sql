-- Dedicated Med MNG player settings: do not change EmotionsCare user_music_preferences.
create table if not exists public.med_mng_player_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorites text[] not null default '{}'::text[],
  history text[] not null default '{}'::text[],
  shuffle_enabled boolean not null default false,
  repeat_mode text not null default 'none'
    check (repeat_mode in ('none', 'one', 'all')),
  volume numeric not null default 1
    check (volume >= 0 and volume <= 1),
  updated_at timestamptz not null default now()
);
alter table public.med_mng_player_preferences enable row level security;
revoke all on public.med_mng_player_preferences from anon;
grant select, insert, update, delete on public.med_mng_player_preferences to authenticated;
drop policy if exists med_mng_player_preferences_select_self on public.med_mng_player_preferences;
create policy med_mng_player_preferences_select_self on public.med_mng_player_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists med_mng_player_preferences_insert_self on public.med_mng_player_preferences;
create policy med_mng_player_preferences_insert_self on public.med_mng_player_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists med_mng_player_preferences_update_self on public.med_mng_player_preferences;
create policy med_mng_player_preferences_update_self on public.med_mng_player_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists med_mng_player_preferences_delete_self on public.med_mng_player_preferences;
create policy med_mng_player_preferences_delete_self on public.med_mng_player_preferences
  for delete to authenticated using ((select auth.uid()) = user_id);

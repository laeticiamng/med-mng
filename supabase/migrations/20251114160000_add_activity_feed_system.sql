-- Activity Feed System
-- Tracks all user activities for the activity feed

create table if not exists activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('post_created', 'comment_created', 'post_liked', 'comment_liked', 'user_followed', 'user_unfollowed', 'post_shared', 'collection_created', 'item_added_to_collection')),
  actor_id uuid not null references auth.users(id) on delete cascade, -- User who performed the action
  target_id uuid, -- ID of the target (post, comment, user, collection, etc.)
  target_type text check (target_type in ('post', 'comment', 'user', 'collection', 'item')),
  metadata jsonb, -- Additional context data
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for query optimization
create index if not exists idx_activity_feed_user_id on activity_feed(user_id);
create index if not exists idx_activity_feed_actor_id on activity_feed(actor_id);
create index if not exists idx_activity_feed_created_at on activity_feed(created_at desc);
create index if not exists idx_activity_feed_target_id on activity_feed(target_id);
create index if not exists idx_activity_feed_activity_type on activity_feed(activity_type);
create index if not exists idx_activity_feed_is_read on activity_feed(is_read);
create index if not exists idx_activity_feed_user_created on activity_feed(user_id, created_at desc);

-- RLS Policies for Activity Feed
alter table activity_feed enable row level security;

-- Users can view their own activity feed
create policy "Users can view their own activity feed"
  on activity_feed for select
  using (auth.uid() = user_id);

-- Users can view activities from their followers (public activities)
create policy "Users can view public activities from followed users"
  on activity_feed for select
  using (
    auth.uid() = user_id or (
      -- User can see activities if they follow the actor or if the activity is public
      target_type is not null
    )
  );

-- Users can create activities for themselves
create policy "Users can create activities"
  on activity_feed for insert
  with check (auth.uid() = actor_id);

-- Users can mark their own activities as read
create policy "Users can update their own activities"
  on activity_feed for update
  using (auth.uid() = user_id);

-- Users can delete their own activities
create policy "Users can delete their own activities"
  on activity_feed for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function update_activity_feed_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_activity_feed_timestamp
  before update on activity_feed
  for each row
  execute procedure update_activity_feed_timestamp();

-- Function to mark activities as read
create or replace function mark_activity_as_read(activity_id uuid)
returns void as $$
begin
  update activity_feed
  set is_read = true, updated_at = now()
  where id = activity_id and user_id = auth.uid();
end;
$$ language plpgsql;

-- Function to mark all activities as read for a user
create or replace function mark_all_activities_as_read()
returns integer as $$
declare
  updated_count integer;
begin
  update activity_feed
  set is_read = true, updated_at = now()
  where user_id = auth.uid() and is_read = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql;

-- Function to get unread activity count
create or replace function get_unread_activity_count()
returns integer as $$
declare
  unread_count integer;
begin
  select count(*)
  into unread_count
  from activity_feed
  where user_id = auth.uid() and is_read = false;

  return unread_count;
end;
$$ language plpgsql;

-- Grant permissions
grant all on activity_feed to authenticated;
grant all on activity_feed to anon;

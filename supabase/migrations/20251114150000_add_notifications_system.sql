-- Add notifications system tables
-- This migration adds comprehensive notification support

-- ==================== NOTIFICATIONS ====================

-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow', 'mention', 'system')),
  title text not null,
  message text,
  related_user_id uuid references auth.users(id) on delete set null,
  related_post_id uuid,
  related_comment_id uuid,
  action_url text,
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Constraints
  constraint valid_notification_type check (type in ('like', 'comment', 'follow', 'mention', 'system'))
);

-- Create indexes for notifications
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);
create index if not exists idx_notifications_is_read on notifications(user_id, is_read);
create index if not exists idx_notifications_type on notifications(user_id, type);

-- Notification preferences table
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Notification type preferences
  likes_enabled boolean default true,
  comments_enabled boolean default true,
  follows_enabled boolean default true,
  mentions_enabled boolean default true,
  system_enabled boolean default true,

  -- Notification frequency
  email_frequency text default 'daily' check (email_frequency in ('instant', 'daily', 'weekly', 'never')),
  push_enabled boolean default true,

  -- Quiet hours
  quiet_hours_enabled boolean default false,
  quiet_hours_start time,
  quiet_hours_end time,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for notification preferences
create index if not exists idx_notification_preferences_user_id on notification_preferences(user_id);

-- Notification read receipts
create table if not exists notification_read_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references notifications(id) on delete cascade,
  read_at timestamp with time zone default now(),

  unique(user_id, notification_id)
);

-- Create indexes for read receipts
create index if not exists idx_notification_read_receipts_user on notification_read_receipts(user_id);
create index if not exists idx_notification_read_receipts_notification on notification_read_receipts(notification_id);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on notifications
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table notification_read_receipts enable row level security;

-- Notifications RLS policies
-- Users can view their own notifications
create policy "users_can_view_own_notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own notifications as read
create policy "users_can_update_own_notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- System can insert notifications
create policy "system_can_insert_notifications"
  on notifications for insert
  with check (true);

-- Notification preferences RLS policies
-- Users can view and update their own preferences
create policy "users_can_view_own_notification_preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "users_can_update_own_notification_preferences"
  on notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_can_insert_notification_preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

-- Notification read receipts RLS policies
create policy "users_can_view_own_read_receipts"
  on notification_read_receipts for select
  using (auth.uid() = user_id);

create policy "users_can_insert_own_read_receipts"
  on notification_read_receipts for insert
  with check (auth.uid() = user_id);

-- ==================== FUNCTIONS ====================

-- Function to mark notification as read
create or replace function mark_notification_as_read(notification_id uuid)
returns void as $$
begin
  update notifications
  set is_read = true, updated_at = now()
  where id = notification_id and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Function to mark all notifications as read
create or replace function mark_all_notifications_as_read()
returns integer as $$
declare
  updated_count integer;
begin
  update notifications
  set is_read = true, updated_at = now()
  where user_id = auth.uid() and is_read = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer;

-- Function to get unread notification count
create or replace function get_unread_notification_count()
returns integer as $$
declare
  unread_count integer;
begin
  select count(*) into unread_count
  from notifications
  where user_id = auth.uid() and is_read = false;

  return unread_count;
end;
$$ language plpgsql security definer;

-- ==================== TRIGGERS ====================

-- Update updated_at on notification changes
create or replace function update_notification_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notifications_update_timestamp
before update on notifications
for each row
execute function update_notification_timestamp();

-- Update updated_at on preference changes
create trigger notification_preferences_update_timestamp
before update on notification_preferences
for each row
execute function update_notification_timestamp();

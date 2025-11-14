-- Wellness & Rituals System
-- Meditation, daily rituals, wellness tracking, and streaks

create table if not exists wellness_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('meditation', 'exercise', 'journaling', 'stretching', 'breathing', 'yoga', 'walking', 'other')),
  name text not null,
  description text,
  duration_minutes integer,
  intensity_level text check (intensity_level in ('low', 'medium', 'high')),
  mood_before text check (mood_before in ('terrible', 'bad', 'neutral', 'good', 'excellent')),
  mood_after text check (mood_after in ('terrible', 'bad', 'neutral', 'good', 'excellent')),
  location text,
  notes text,
  tags text[] default '{}',
  heart_rate integer, -- optional for fitness activities
  calories_burned integer, -- optional for exercise
  is_shared boolean default false,
  activity_date date not null,
  activity_time time,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (category in ('morning', 'evening', 'exercise', 'meditation', 'other')),
  frequency text not null check (frequency in ('daily', 'weekly', 'custom')) default 'daily',
  duration_minutes integer,
  is_active boolean default true,
  reminder_enabled boolean default true,
  reminder_time time,
  color text, -- for UI display
  icon text,
  order_index integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists ritual_completions (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references rituals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  duration_minutes integer,
  notes text,
  mood_before text,
  mood_after text,
  is_late boolean default false -- if completed after reminder time
);

create table if not exists wellness_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- meditation, exercise, journaling, etc
  current_streak integer default 0,
  best_streak integer default 0,
  days_completed integer default 0, -- total days with activity
  last_completed_date date,
  streak_started_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, activity_type)
);

create table if not exists wellness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null check (goal_type in ('meditation', 'exercise', 'journaling', 'water', 'sleep', 'other')),
  title text not null,
  description text,
  target_value integer, -- minutes, liters, hours, etc
  target_unit text, -- minutes, liters, hours, count, etc
  frequency text check (frequency in ('daily', 'weekly', 'monthly')) default 'daily',
  current_progress integer default 0,
  status text check (status in ('active', 'completed', 'abandoned')) default 'active',
  start_date date not null,
  end_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists wellness_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meditation_minutes_total integer default 0,
  exercise_minutes_total integer default 0,
  journaling_minutes_total integer default 0,
  activities_completed_total integer default 0,
  rituals_completed_total integer default 0,
  wellness_score decimal default 0, -- 0-100
  last_activity_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Indexes for query optimization
create index if not exists idx_wellness_activities_user_id on wellness_activities(user_id);
create index if not exists idx_wellness_activities_activity_type on wellness_activities(activity_type);
create index if not exists idx_wellness_activities_date on wellness_activities(activity_date desc);
create index if not exists idx_wellness_activities_user_date on wellness_activities(user_id, activity_date desc);

create index if not exists idx_rituals_user_id on rituals(user_id);
create index if not exists idx_rituals_category on rituals(category);
create index if not exists idx_rituals_active on rituals(is_active);

create index if not exists idx_ritual_completions_ritual_id on ritual_completions(ritual_id);
create index if not exists idx_ritual_completions_user_id on ritual_completions(user_id);
create index if not exists idx_ritual_completions_date on ritual_completions(completed_at desc);

create index if not exists idx_wellness_streaks_user_id on wellness_streaks(user_id);
create index if not exists idx_wellness_streaks_current on wellness_streaks(current_streak desc);

create index if not exists idx_wellness_goals_user_id on wellness_goals(user_id);
create index if not exists idx_wellness_goals_status on wellness_goals(status);

-- RLS Policies
alter table wellness_activities enable row level security;
alter table rituals enable row level security;
alter table ritual_completions enable row level security;
alter table wellness_streaks enable row level security;
alter table wellness_goals enable row level security;
alter table wellness_stats enable row level security;

-- Wellness activities - users can only view/modify their own
create policy "Users can view their own wellness activities"
  on wellness_activities for select
  using (auth.uid() = user_id);

create policy "Users can create wellness activities"
  on wellness_activities for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wellness activities"
  on wellness_activities for update
  using (auth.uid() = user_id);

-- Rituals - users can only manage their own
create policy "Users can view their own rituals"
  on rituals for select
  using (auth.uid() = user_id);

create policy "Users can create rituals"
  on rituals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rituals"
  on rituals for update
  using (auth.uid() = user_id);

-- Ritual completions
create policy "Users can view their ritual completions"
  on ritual_completions for select
  using (auth.uid() = user_id);

create policy "Users can log ritual completions"
  on ritual_completions for insert
  with check (auth.uid() = user_id);

-- Streaks
create policy "Users can view their streaks"
  on wellness_streaks for select
  using (auth.uid() = user_id);

-- Goals
create policy "Users can view their wellness goals"
  on wellness_goals for select
  using (auth.uid() = user_id);

create policy "Users can create wellness goals"
  on wellness_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their wellness goals"
  on wellness_goals for update
  using (auth.uid() = user_id);

-- Stats
create policy "Users can view their wellness stats"
  on wellness_stats for select
  using (auth.uid() = user_id);

-- Trigger to update timestamps
create or replace function update_wellness_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_wellness_activities_timestamp
  before update on wellness_activities
  for each row
  execute procedure update_wellness_timestamp();

create trigger update_rituals_timestamp
  before update on rituals
  for each row
  execute procedure update_wellness_timestamp();

create trigger update_wellness_streaks_timestamp
  before update on wellness_streaks
  for each row
  execute procedure update_wellness_timestamp();

create trigger update_wellness_goals_timestamp
  before update on wellness_goals
  for each row
  execute procedure update_wellness_timestamp();

create trigger update_wellness_stats_timestamp
  before update on wellness_stats
  for each row
  execute procedure update_wellness_timestamp();

-- Function to complete ritual
create or replace function complete_ritual(
  ritual_id_param uuid,
  duration_param integer,
  notes_param text default null,
  mood_before_param text default null,
  mood_after_param text default null
)
returns void as $$
begin
  insert into ritual_completions (ritual_id, user_id, duration_minutes, notes, mood_before, mood_after)
  values (ritual_id_param, auth.uid(), duration_param, notes_param, mood_before_param, mood_after_param);
end;
$$ language plpgsql;

-- Function to log wellness activity
create or replace function log_wellness_activity(
  activity_type_param text,
  name_param text,
  duration_param integer,
  activity_date_param date
)
returns uuid as $$
declare
  activity_id uuid;
begin
  insert into wellness_activities (user_id, activity_type, name, duration_minutes, activity_date)
  values (auth.uid(), activity_type_param, name_param, duration_param, activity_date_param)
  returning id into activity_id;

  return activity_id;
end;
$$ language plpgsql;

-- Grant permissions
grant all on wellness_activities to authenticated;
grant all on rituals to authenticated;
grant all on ritual_completions to authenticated;
grant all on wellness_streaks to authenticated;
grant all on wellness_goals to authenticated;
grant all on wellness_stats to authenticated;

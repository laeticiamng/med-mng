-- User Profiles System
-- Extended user profile information with statistics and achievements

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  location text,
  website text,
  occupation text,
  education text,
  social_links jsonb default '{}'::jsonb, -- Links to social media profiles
  verified boolean default false,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists user_statistics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  posts_count integer default 0,
  comments_count integer default 0,
  likes_received integer default 0,
  followers_count integer default 0,
  following_count integer default 0,
  total_views integer default 0,
  engagement_score float default 0,
  last_active_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in (
    'first_post', 'first_comment', 'first_like', 'ten_posts', 'hundred_posts',
    'ten_followers', 'hundred_followers', 'thousand_followers',
    'top_contributor', 'helpful_member', 'verified_user', 'streak_10_days',
    'streak_100_days', 'engagement_master', 'trending_post'
  )),
  title text not null,
  description text,
  icon_url text,
  earned_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user_id, achievement_type)
);

create table if not exists user_following (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Indexes for query optimization
create index if not exists idx_user_profiles_user_id on user_profiles(user_id);
create index if not exists idx_user_profiles_verified on user_profiles(verified);
create index if not exists idx_user_profiles_is_public on user_profiles(is_public);
create index if not exists idx_user_statistics_user_id on user_statistics(user_id);
create index if not exists idx_user_statistics_posts_count on user_statistics(posts_count desc);
create index if not exists idx_user_statistics_followers_count on user_statistics(followers_count desc);
create index if not exists idx_user_statistics_engagement_score on user_statistics(engagement_score desc);
create index if not exists idx_user_achievements_user_id on user_achievements(user_id);
create index if not exists idx_user_achievements_type on user_achievements(achievement_type);
create index if not exists idx_user_achievements_earned_at on user_achievements(earned_at desc);
create index if not exists idx_user_following_follower_id on user_following(follower_id);
create index if not exists idx_user_following_following_id on user_following(following_id);
create index if not exists idx_user_following_created_at on user_following(created_at desc);

-- RLS Policies
alter table user_profiles enable row level security;
alter table user_statistics enable row level security;
alter table user_achievements enable row level security;
alter table user_following enable row level security;

-- Users can view public profiles
create policy "Users can view public profiles"
  on user_profiles for select
  using (is_public = true or auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

-- Users can create their own profile
create policy "Users can create their own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

-- User statistics are public
create policy "User statistics are public"
  on user_statistics for select
  using (true);

-- User achievements are public
create policy "User achievements are public"
  on user_achievements for select
  using (true);

-- Users can follow/unfollow
create policy "Users can manage their follows"
  on user_following for all
  using (auth.uid() = follower_id);

-- Users can view followers
create policy "Users can view followers"
  on user_following for select
  using (true);

-- Trigger to update user_profiles timestamp
create or replace function update_user_profiles_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_timestamp
  before update on user_profiles
  for each row
  execute procedure update_user_profiles_timestamp();

-- Trigger to update user_statistics timestamp
create or replace function update_user_statistics_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_statistics_timestamp
  before update on user_statistics
  for each row
  execute procedure update_user_statistics_timestamp();

-- Function to get user profile with stats
create or replace function get_user_profile_with_stats(user_id_param uuid)
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  bio text,
  avatar_url text,
  posts_count integer,
  followers_count integer,
  following_count integer,
  verified boolean,
  engagement_score float
) as $$
begin
  return query
  select
    up.id,
    up.user_id,
    up.display_name,
    up.bio,
    up.avatar_url,
    us.posts_count,
    us.followers_count,
    us.following_count,
    up.verified,
    us.engagement_score
  from user_profiles up
  left join user_statistics us on up.user_id = us.user_id
  where up.user_id = user_id_param;
end;
$$ language plpgsql;

-- Function to follow a user
create or replace function follow_user(following_id_param uuid)
returns void as $$
begin
  insert into user_following (follower_id, following_id)
  values (auth.uid(), following_id_param);

  update user_statistics
  set followers_count = followers_count + 1
  where user_id = following_id_param;
end;
$$ language plpgsql;

-- Function to unfollow a user
create or replace function unfollow_user(following_id_param uuid)
returns void as $$
begin
  delete from user_following
  where follower_id = auth.uid() and following_id = following_id_param;

  update user_statistics
  set followers_count = followers_count - 1
  where user_id = following_id_param and followers_count > 0;
end;
$$ language plpgsql;

-- Function to check if user is following
create or replace function is_user_following(target_user_id uuid)
returns boolean as $$
declare
  result boolean;
begin
  select exists(
    select 1 from user_following
    where follower_id = auth.uid() and following_id = target_user_id
  ) into result;

  return result;
end;
$$ language plpgsql;

-- Grant permissions
grant all on user_profiles to authenticated;
grant all on user_statistics to authenticated;
grant all on user_achievements to authenticated;
grant all on user_following to authenticated;

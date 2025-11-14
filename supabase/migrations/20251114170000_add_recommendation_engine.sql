-- Recommendation Engine System
-- Provides personalized content recommendations based on user behavior

create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  interests jsonb default '[]'::jsonb, -- Array of interest tags
  preferred_categories jsonb default '[]'::jsonb, -- Preferred content categories
  reading_time integer default 5, -- Preferred reading time in minutes
  engagement_level text check (engagement_level in ('low', 'medium', 'high')) default 'medium',
  learning_style text check (learning_style in ('visual', 'auditory', 'reading', 'kinesthetic', 'mixed')) default 'mixed',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists content_metadata (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null, -- ID of the post, article, etc.
  content_type text not null check (content_type in ('post', 'article', 'video', 'audio', 'collection')),
  title text not null,
  description text,
  categories jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')) default 'intermediate',
  estimated_reading_time integer, -- in minutes
  engagement_score float default 0, -- Calculated from interactions
  view_count integer default 0,
  like_count integer default 0,
  comment_count integer default 0,
  share_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(content_id, content_type)
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null,
  content_type text not null,
  recommendation_source text not null check (recommendation_source in ('collaborative', 'content_based', 'trending', 'personalized', 'social')),
  relevance_score float not null, -- 0-1 relevance score
  reason text, -- Human-readable reason for recommendation
  clicked boolean default false,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '7 days')
);

create table if not exists user_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null,
  content_type text not null,
  interaction_type text not null check (interaction_type in ('view', 'like', 'comment', 'share', 'bookmark', 'read')),
  duration_seconds integer, -- Time spent on content
  created_at timestamp with time zone default now()
);

-- Indexes for query optimization
create index if not exists idx_user_preferences_user_id on user_preferences(user_id);
create index if not exists idx_content_metadata_content_id on content_metadata(content_id);
create index if not exists idx_content_metadata_type on content_metadata(content_type);
create index if not exists idx_recommendations_user_id on recommendations(user_id);
create index if not exists idx_recommendations_content_id on recommendations(content_id);
create index if not exists idx_recommendations_created_at on recommendations(created_at desc);
create index if not exists idx_recommendations_expires_at on recommendations(expires_at);
create index if not exists idx_user_interactions_user_id on user_interactions(user_id);
create index if not exists idx_user_interactions_content_id on user_interactions(content_id);
create index if not exists idx_user_interactions_created_at on user_interactions(created_at desc);

-- RLS Policies
alter table user_preferences enable row level security;
alter table content_metadata enable row level security;
alter table recommendations enable row level security;
alter table user_interactions enable row level security;

-- User can view and update their own preferences
create policy "Users can view their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

-- Content metadata is readable by all authenticated users
create policy "All users can view content metadata"
  on content_metadata for select
  using (auth.role() = 'authenticated');

-- Recommendations are viewable only by the user
create policy "Users can view their own recommendations"
  on recommendations for select
  using (auth.uid() = user_id);

-- Interactions are recorded for authenticated users
create policy "Users can record their own interactions"
  on user_interactions for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own interactions"
  on user_interactions for select
  using (auth.uid() = user_id);

-- Trigger to update user_preferences timestamp
create or replace function update_user_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_preferences_timestamp
  before update on user_preferences
  for each row
  execute procedure update_user_preferences_timestamp();

-- Trigger to update content_metadata timestamp
create or replace function update_content_metadata_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_content_metadata_timestamp
  before update on content_metadata
  for each row
  execute procedure update_content_metadata_timestamp();

-- Function to get recommendations for a user
create or replace function get_user_recommendations(user_id_param uuid, limit_param int default 10)
returns table (
  id uuid,
  content_id uuid,
  content_type text,
  title text,
  description text,
  relevance_score float,
  reason text,
  recommendation_source text
) as $$
begin
  return query
  select
    r.id,
    r.content_id,
    r.content_type,
    cm.title,
    cm.description,
    r.relevance_score,
    r.reason,
    r.recommendation_source
  from recommendations r
  join content_metadata cm on r.content_id = cm.content_id and r.content_type = cm.content_type
  where r.user_id = user_id_param
    and r.expires_at > now()
  order by r.relevance_score desc, r.created_at desc
  limit limit_param;
end;
$$ language plpgsql;

-- Function to record user interaction
create or replace function record_user_interaction(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text,
  interaction_type_param text,
  duration_seconds_param int default null
)
returns void as $$
begin
  insert into user_interactions (user_id, content_id, content_type, interaction_type, duration_seconds)
  values (user_id_param, content_id_param, content_type_param, interaction_type_param, duration_seconds_param);
end;
$$ language plpgsql;

-- Grant permissions
grant all on user_preferences to authenticated;
grant all on content_metadata to authenticated;
grant all on recommendations to authenticated;
grant all on user_interactions to authenticated;

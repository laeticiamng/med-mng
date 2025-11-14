-- Posts and Comments System
-- Core social content management

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  description text,
  image_url text,
  category text, -- lifestyle, learning, wellness, achievement, question
  tags text[] default '{}',
  visibility text not null check (visibility in ('public', 'followers', 'private')) default 'public',
  allows_comments boolean default true,
  allows_likes boolean default true,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  views_count integer default 0,
  engagement_score decimal default 0,
  is_pinned boolean default false,
  is_featured boolean default false,
  status text not null check (status in ('draft', 'published', 'archived')) default 'published',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone,
  deleted_at timestamp with time zone
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references comments(id) on delete cascade, -- For nested replies
  likes_count integer default 0,
  is_edited boolean default false,
  edited_at timestamp with time zone,
  status text not null check (status in ('published', 'deleted', 'moderated')) default 'published',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

create table if not exists comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(comment_id, user_id)
);

create table if not exists post_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  shared_to text, -- 'followers', 'direct', 'public'
  message text,
  created_at timestamp with time zone default now()
);

create table if not exists post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- Indexes for query optimization
create index if not exists idx_posts_user_id on posts(user_id);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_visibility on posts(visibility);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_posts_category on posts(category);
create index if not exists idx_posts_engagement_score on posts(engagement_score desc);
create index if not exists idx_posts_user_status on posts(user_id, status);

create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_comments_user_id on comments(user_id);
create index if not exists idx_comments_parent_id on comments(parent_comment_id);
create index if not exists idx_comments_created_at on comments(created_at desc);

create index if not exists idx_post_likes_post_id on post_likes(post_id);
create index if not exists idx_post_likes_user_id on post_likes(user_id);

create index if not exists idx_comment_likes_comment_id on comment_likes(comment_id);
create index if not exists idx_post_bookmarks_user_id on post_bookmarks(user_id);

-- RLS Policies
alter table posts enable row level security;
alter table comments enable row level security;
alter table post_likes enable row level security;
alter table comment_likes enable row level security;
alter table post_shares enable row level security;
alter table post_bookmarks enable row level security;

-- Posts policies
create policy "Users can view published posts"
  on posts for select
  using (status = 'published' and deleted_at is null);

create policy "Users can view their own posts"
  on posts for select
  using (auth.uid() = user_id);

create policy "Users can create posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- Comments policies
create policy "Users can view comments on published posts"
  on comments for select
  using (
    post_id in (
      select id from posts where status = 'published' and deleted_at is null
    )
    and status = 'published'
  );

create policy "Users can create comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on comments for update
  using (auth.uid() = user_id);

-- Likes policies
create policy "Users can view post likes"
  on post_likes for select
  using (true);

create policy "Users can like posts"
  on post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their likes"
  on post_likes for delete
  using (auth.uid() = user_id);

-- Bookmarks policies
create policy "Users can view their bookmarks"
  on post_bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can create bookmarks"
  on post_bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their bookmarks"
  on post_bookmarks for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function update_posts_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_timestamp
  before update on posts
  for each row
  execute procedure update_posts_timestamp();

create trigger update_comments_timestamp
  before update on comments
  for each row
  execute procedure update_posts_timestamp();

-- Function to like a post
create or replace function like_post(post_id_param uuid)
returns void as $$
declare
  v_post_id uuid;
begin
  insert into post_likes (post_id, user_id) values (post_id_param, auth.uid())
  on conflict (post_id, user_id) do nothing;
  
  update posts set likes_count = likes_count + 1
  where id = post_id_param;
end;
$$ language plpgsql;

-- Function to unlike a post
create or replace function unlike_post(post_id_param uuid)
returns void as $$
begin
  delete from post_likes where post_id = post_id_param and user_id = auth.uid();
  
  update posts set likes_count = greatest(0, likes_count - 1)
  where id = post_id_param;
end;
$$ language plpgsql;

-- Function to get feed posts
create or replace function get_feed_posts(limit_param integer default 20, offset_param integer default 0)
returns table (
  id uuid,
  user_id uuid,
  title text,
  content text,
  description text,
  image_url text,
  category text,
  likes_count integer,
  comments_count integer,
  shares_count integer,
  views_count integer,
  created_at timestamp with time zone,
  is_liked boolean
) as $$
begin
  return query
  select
    p.id,
    p.user_id,
    p.title,
    p.content,
    p.description,
    p.image_url,
    p.category,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.views_count,
    p.created_at,
    exists(select 1 from post_likes where post_id = p.id and user_id = auth.uid()) as is_liked
  from posts p
  where p.status = 'published'
    and p.deleted_at is null
    and (p.visibility = 'public' or p.user_id = auth.uid())
  order by p.created_at desc
  limit limit_param
  offset offset_param;
end;
$$ language plpgsql;

-- Grant permissions
grant all on posts to authenticated;
grant all on comments to authenticated;
grant all on post_likes to authenticated;
grant all on comment_likes to authenticated;
grant all on post_shares to authenticated;
grant all on post_bookmarks to authenticated;

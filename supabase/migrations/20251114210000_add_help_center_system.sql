-- Help Center & Support System
-- FAQs, Tutorials, Help Articles, and Support

create table if not exists help_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  description text,
  category text not null, -- getting-started, features, troubleshooting, account, billing, other
  subcategory text,
  author_id uuid references auth.users(id),
  tags text[] default '{}',
  views_count integer default 0,
  helpful_count integer default 0,
  unhelpful_count integer default 0,
  is_featured boolean default false,
  is_published boolean default true,
  is_pinned boolean default false,
  order_index integer,
  related_articles uuid[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null, -- platform, features, account, billing, security, other
  order_index integer,
  views_count integer default 0,
  helpful_count integer default 0,
  unhelpful_count integer default 0,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists tutorials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text not null,
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  category text not null, -- getting-started, features, advanced, tips, other
  video_url text,
  estimated_duration_minutes integer, -- reading/watching time
  tags text[] default '{}',
  views_count integer default 0,
  helpful_count integer default 0,
  is_published boolean default true,
  order_index integer,
  prerequisites uuid[] default '{}', -- other tutorial IDs
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists help_search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  search_query text not null,
  results_count integer,
  clicked_article_id uuid,
  is_helpful boolean, -- user feedback
  created_at timestamp with time zone default now()
);

create table if not exists help_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  article_id uuid references help_articles(id) on delete cascade,
  is_helpful boolean,
  feedback_text text,
  created_at timestamp with time zone default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  description text not null,
  category text not null, -- bug, feature-request, account-issue, billing, other
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  status text check (status in ('open', 'in_progress', 'on_hold', 'resolved', 'closed')) default 'open',
  assigned_to uuid references auth.users(id),
  resolution_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone
);

-- Indexes for query optimization
create index if not exists idx_help_articles_slug on help_articles(slug);
create index if not exists idx_help_articles_category on help_articles(category);
create index if not exists idx_help_articles_published on help_articles(is_published);
create index if not exists idx_help_articles_featured on help_articles(is_featured);
create index if not exists idx_help_articles_views on help_articles(views_count desc);

create index if not exists idx_faqs_category on faqs(category);
create index if not exists idx_faqs_published on faqs(is_published);

create index if not exists idx_tutorials_category on tutorials(category);
create index if not exists idx_tutorials_difficulty on tutorials(difficulty_level);
create index if not exists idx_tutorials_published on tutorials(is_published);

create index if not exists idx_help_search_logs_query on help_search_logs(search_query);
create index if not exists idx_help_search_logs_user_id on help_search_logs(user_id);

create index if not exists idx_help_feedback_article_id on help_feedback(article_id);
create index if not exists idx_help_feedback_user_id on help_feedback(user_id);

create index if not exists idx_support_tickets_user_id on support_tickets(user_id);
create index if not exists idx_support_tickets_status on support_tickets(status);
create index if not exists idx_support_tickets_priority on support_tickets(priority);
create index if not exists idx_support_tickets_created_at on support_tickets(created_at desc);

-- RLS Policies
alter table help_articles enable row level security;
alter table faqs enable row level security;
alter table tutorials enable row level security;
alter table help_search_logs enable row level security;
alter table help_feedback enable row level security;
alter table support_tickets enable row level security;

-- Help articles - public read, admin write
create policy "Anyone can view published help articles"
  on help_articles for select
  using (is_published = true);

create policy "Admin can manage help articles"
  on help_articles for insert
  with check (auth.jwt() ->> 'email' like '%@admin%');

-- FAQs - public read
create policy "Anyone can view published FAQs"
  on faqs for select
  using (is_published = true);

-- Tutorials - public read
create policy "Anyone can view published tutorials"
  on tutorials for select
  using (is_published = true);

-- Search logs - users can create own
create policy "Users can log their searches"
  on help_search_logs for insert
  with check (auth.uid() = user_id or user_id is null);

-- Help feedback - users can create own
create policy "Users can provide help feedback"
  on help_feedback for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can view their own feedback"
  on help_feedback for select
  using (auth.uid() = user_id or user_id is null);

-- Support tickets - user owns or admin
create policy "Users can view their own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);

create policy "Users can create tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tickets"
  on support_tickets for update
  using (auth.uid() = user_id);

-- Trigger to update timestamps
create or replace function update_help_articles_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_help_articles_timestamp
  before update on help_articles
  for each row
  execute procedure update_help_articles_timestamp();

create trigger update_faqs_timestamp
  before update on faqs
  for each row
  execute procedure update_help_articles_timestamp();

create trigger update_tutorials_timestamp
  before update on tutorials
  for each row
  execute procedure update_help_articles_timestamp();

-- Function to search help articles
create or replace function search_help_articles(search_query text, limit_param integer default 20)
returns table (
  id uuid,
  title text,
  description text,
  category text,
  views_count integer
) as $$
begin
  return query
  select
    ha.id,
    ha.title,
    ha.description,
    ha.category,
    ha.views_count
  from help_articles ha
  where ha.is_published = true
    and (ha.title ilike '%' || search_query || '%'
      or ha.description ilike '%' || search_query || '%'
      or ha.content ilike '%' || search_query || '%')
  order by ha.views_count desc
  limit limit_param;
end;
$$ language plpgsql;

-- Grant permissions
grant all on help_articles to authenticated;
grant all on faqs to authenticated;
grant all on tutorials to authenticated;
grant all on help_search_logs to authenticated;
grant all on help_feedback to authenticated;
grant all on support_tickets to authenticated;

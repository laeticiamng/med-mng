-- Data Export System
-- Manages user data export requests and jobs

create table if not exists export_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  export_type text not null check (export_type in ('personal_data', 'posts', 'comments', 'interactions', 'full_archive')),
  format text not null check (format in ('csv', 'json', 'pdf')),
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  progress integer default 0, -- 0-100 percentage
  total_items integer default 0,
  processed_items integer default 0,
  file_url text, -- URL to download the exported file
  file_size integer, -- Size in bytes
  error_message text, -- If status is 'failed'
  metadata jsonb, -- Additional context data
  requested_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  expires_at timestamp with time zone default (now() + interval '30 days'), -- File expires after 30 days
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists export_logs (
  id uuid primary key default gen_random_uuid(),
  export_job_id uuid not null references export_jobs(id) on delete cascade,
  event_type text not null check (event_type in ('started', 'processing', 'completed', 'error', 'downloaded')),
  message text,
  created_at timestamp with time zone default now()
);

-- Indexes for query optimization
create index if not exists idx_export_jobs_user_id on export_jobs(user_id);
create index if not exists idx_export_jobs_status on export_jobs(status);
create index if not exists idx_export_jobs_created_at on export_jobs(created_at desc);
create index if not exists idx_export_jobs_expires_at on export_jobs(expires_at);
create index if not exists idx_export_jobs_user_status on export_jobs(user_id, status);
create index if not exists idx_export_logs_export_job_id on export_logs(export_job_id);
create index if not exists idx_export_logs_created_at on export_logs(created_at desc);

-- RLS Policies
alter table export_jobs enable row level security;
alter table export_logs enable row level security;

-- Users can view their own export jobs
create policy "Users can view their own export jobs"
  on export_jobs for select
  using (auth.uid() = user_id);

-- Users can create export jobs
create policy "Users can create export jobs"
  on export_jobs for insert
  with check (auth.uid() = user_id);

-- Users can view logs for their own exports
create policy "Users can view their own export logs"
  on export_logs for select
  using (
    export_job_id in (
      select id from export_jobs where user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
create or replace function update_export_jobs_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_export_jobs_timestamp
  before update on export_jobs
  for each row
  execute procedure update_export_jobs_timestamp();

-- Function to create export job
create or replace function create_export_job(
  export_type_param text,
  format_param text
)
returns uuid as $$
declare
  job_id uuid;
begin
  insert into export_jobs (user_id, export_type, format)
  values (auth.uid(), export_type_param, format_param)
  returning id into job_id;

  return job_id;
end;
$$ language plpgsql;

-- Function to update export progress
create or replace function update_export_progress(
  job_id_param uuid,
  progress_param integer,
  processed_param integer
)
returns void as $$
begin
  update export_jobs
  set progress = progress_param, processed_items = processed_param
  where id = job_id_param and user_id = auth.uid();
end;
$$ language plpgsql;

-- Function to complete export job
create or replace function complete_export_job(
  job_id_param uuid,
  file_url_param text,
  file_size_param integer
)
returns void as $$
begin
  update export_jobs
  set
    status = 'completed',
    file_url = file_url_param,
    file_size = file_size_param,
    completed_at = now(),
    progress = 100
  where id = job_id_param and user_id = auth.uid();

  insert into export_logs (export_job_id, event_type, message)
  values (job_id_param, 'completed', 'Export completed successfully');
end;
$$ language plpgsql;

-- Function to fail export job
create or replace function fail_export_job(
  job_id_param uuid,
  error_message_param text
)
returns void as $$
begin
  update export_jobs
  set
    status = 'failed',
    error_message = error_message_param
  where id = job_id_param;

  insert into export_logs (export_job_id, event_type, message)
  values (job_id_param, 'error', error_message_param);
end;
$$ language plpgsql;

-- Function to get export status
create or replace function get_export_status(job_id_param uuid)
returns table (
  status text,
  progress integer,
  file_url text,
  completed_at timestamp with time zone
) as $$
begin
  return query
  select
    export_jobs.status,
    export_jobs.progress,
    export_jobs.file_url,
    export_jobs.completed_at
  from export_jobs
  where id = job_id_param and user_id = auth.uid();
end;
$$ language plpgsql;

-- Grant permissions
grant all on export_jobs to authenticated;
grant all on export_logs to authenticated;

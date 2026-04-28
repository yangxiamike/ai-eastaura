create extension if not exists pgcrypto;

do $$ begin
  create type content_status as enum (
    'idea',
    'briefed',
    'drafted',
    'storyboarded',
    'compliance_review',
    'approved',
    'scheduled',
    'published',
    'measured'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type review_status as enum (
    'open',
    'approved',
    'needs_revision',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type publish_channel as enum (
    'website',
    'instagram',
    'tiktok',
    'youtube',
    'xiaohongshu',
    'email',
    'paid_ad',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type content_asset_format as enum (
    'article',
    'short_video',
    'image',
    'carousel',
    'email',
    'ad',
    'landing_page',
    'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  objective text not null,
  status content_status not null default 'idea',
  target_audience text,
  source text,
  owner text,
  start_date date,
  end_date date,
  budget_usd numeric(12, 2),
  tags text[] not null default '{}'
);

create table if not exists content_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status content_status not null default 'idea',
  title text not null,
  format content_asset_format not null,
  channel publish_channel not null,
  brief text,
  body text,
  call_to_action text,
  landing_url text,
  source text,
  tags text[] not null default '{}'
);

create table if not exists storyboards (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  asset_id uuid not null references content_assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  status content_status not null default 'storyboarded',
  scenes jsonb not null default '[]'::jsonb,
  notes text
);

create table if not exists review_tasks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  asset_id uuid not null references content_assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status review_status not null default 'open',
  reviewer text not null,
  notes text,
  due_at timestamptz,
  decided_at timestamptz
);

create table if not exists publish_posts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  asset_id uuid not null references content_assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  channel publish_channel not null,
  status content_status not null default 'scheduled',
  scheduled_at timestamptz,
  published_at timestamptz,
  post_url text,
  external_post_id text,
  tracking_code text
);

create table if not exists content_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  asset_id uuid references content_assets(id) on delete set null,
  publish_post_id uuid references publish_posts(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  occurred_at timestamptz not null default now(),
  source text,
  channel publish_channel,
  metric_type text not null,
  metric_value numeric(14, 4) not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists campaigns_created_at_idx on campaigns(created_at desc);
create index if not exists campaigns_status_created_at_idx on campaigns(status, created_at desc);
create index if not exists campaigns_source_created_at_idx on campaigns(source, created_at desc);
create index if not exists content_assets_campaign_id_created_at_idx on content_assets(campaign_id, created_at desc);
create index if not exists content_assets_status_created_at_idx on content_assets(status, created_at desc);
create index if not exists content_assets_channel_created_at_idx on content_assets(channel, created_at desc);
create index if not exists storyboards_campaign_id_created_at_idx on storyboards(campaign_id, created_at desc);
create index if not exists storyboards_asset_id_created_at_idx on storyboards(asset_id, created_at desc);
create index if not exists review_tasks_campaign_id_created_at_idx on review_tasks(campaign_id, created_at desc);
create index if not exists review_tasks_asset_id_created_at_idx on review_tasks(asset_id, created_at desc);
create index if not exists review_tasks_status_created_at_idx on review_tasks(status, created_at desc);
create index if not exists publish_posts_campaign_id_created_at_idx on publish_posts(campaign_id, created_at desc);
create index if not exists publish_posts_asset_id_created_at_idx on publish_posts(asset_id, created_at desc);
create index if not exists publish_posts_tracking_code_idx on publish_posts(tracking_code);
create index if not exists content_metrics_campaign_id_occurred_at_idx on content_metrics(campaign_id, occurred_at desc);
create index if not exists content_metrics_asset_id_occurred_at_idx on content_metrics(asset_id, occurred_at desc);
create index if not exists content_metrics_publish_post_id_occurred_at_idx on content_metrics(publish_post_id, occurred_at desc);
create index if not exists content_metrics_lead_id_occurred_at_idx on content_metrics(lead_id, occurred_at desc);
create index if not exists content_metrics_source_occurred_at_idx on content_metrics(source, occurred_at desc);
create index if not exists content_metrics_channel_occurred_at_idx on content_metrics(channel, occurred_at desc);
create index if not exists content_metrics_metric_type_occurred_at_idx on content_metrics(metric_type, occurred_at desc);

alter table leads add column if not exists campaign text;
alter table leads add column if not exists utm_source text;
alter table leads add column if not exists utm_medium text;
alter table leads add column if not exists utm_campaign text;
alter table leads add column if not exists utm_content text;

create index if not exists leads_campaign_created_at_idx on leads(campaign, created_at desc);
create index if not exists leads_utm_content_created_at_idx on leads(utm_content, created_at desc);

drop trigger if exists campaigns_set_updated_at on campaigns;
create trigger campaigns_set_updated_at
before update on campaigns
for each row execute function set_updated_at();

drop trigger if exists content_assets_set_updated_at on content_assets;
create trigger content_assets_set_updated_at
before update on content_assets
for each row execute function set_updated_at();

drop trigger if exists storyboards_set_updated_at on storyboards;
create trigger storyboards_set_updated_at
before update on storyboards
for each row execute function set_updated_at();

drop trigger if exists review_tasks_set_updated_at on review_tasks;
create trigger review_tasks_set_updated_at
before update on review_tasks
for each row execute function set_updated_at();

drop trigger if exists publish_posts_set_updated_at on publish_posts;
create trigger publish_posts_set_updated_at
before update on publish_posts
for each row execute function set_updated_at();

alter table campaigns enable row level security;
alter table content_assets enable row level security;
alter table storyboards enable row level security;
alter table review_tasks enable row level security;
alter table publish_posts enable row level security;
alter table content_metrics enable row level security;

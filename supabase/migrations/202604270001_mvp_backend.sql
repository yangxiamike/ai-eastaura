create extension if not exists pgcrypto;

do $$ begin
  create type lead_status as enum (
    'new',
    'triaged',
    'needs_review',
    'contacted',
    'qualified',
    'not_fit',
    'closed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type risk_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_channel as enum ('in_app', 'email', 'feishu');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_type as enum ('new_lead', 'high_intent', 'high_risk');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_event_type as enum (
    'lead_created',
    'triage_run',
    'status_changed',
    'note_added',
    'notification_created',
    'notification_delivered',
    'notification_failed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_event_actor as enum ('system', 'founder', 'agent');
exception when duplicate_object then null;
end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status lead_status not null default 'new',
  full_name text not null,
  email text not null,
  country text,
  age_range text,
  goals text[] not null default '{}',
  preferred_timing text,
  budget_usd numeric(12, 2),
  travel_party_size integer,
  free_text text,
  source text not null default 'direct',
  consent_to_contact boolean not null default false,
  latest_ai_run_id uuid,
  risk_level risk_level,
  fit_score numeric(5, 2),
  intent_score numeric(5, 2),
  risk_score numeric(5, 2),
  latest_ai_summary text
);

create table if not exists lead_intakes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  raw_payload jsonb not null
);

create table if not exists ai_runs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  agent_key text not null,
  provider text not null default 'mock',
  model text,
  skill_refs jsonb not null,
  prompt_snapshot text not null,
  output_schema_version text not null,
  output jsonb not null
);

do $$ begin
  alter table leads
    add constraint leads_latest_ai_run_id_fkey
    foreign key (latest_ai_run_id) references ai_runs(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  body text not null,
  author text not null default 'founder'
);

create table if not exists lead_status_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  from_status lead_status not null,
  to_status lead_status not null,
  reason text
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  channel notification_channel not null,
  type notification_type not null,
  title text not null,
  body text not null,
  lead_id uuid not null references leads(id) on delete cascade,
  delivered boolean not null default false,
  delivered_at timestamptz,
  delivery_error text
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  type lead_event_type not null,
  actor lead_event_actor not null default 'system',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists leads_status_created_at_idx on leads(status, created_at desc);
create index if not exists leads_risk_level_created_at_idx on leads(risk_level, created_at desc);
create index if not exists leads_source_created_at_idx on leads(source, created_at desc);
create index if not exists leads_country_created_at_idx on leads(country, created_at desc);
create index if not exists leads_email_idx on leads(email);
create index if not exists ai_runs_lead_id_created_at_idx on ai_runs(lead_id, created_at desc);
create index if not exists lead_notes_lead_id_created_at_idx on lead_notes(lead_id, created_at desc);
create index if not exists lead_status_events_lead_id_created_at_idx on lead_status_events(lead_id, created_at desc);
create index if not exists notifications_created_at_idx on notifications(created_at desc);
create index if not exists notifications_lead_id_idx on notifications(lead_id);
create index if not exists lead_events_lead_id_created_at_idx on lead_events(lead_id, created_at desc);
create index if not exists lead_events_type_created_at_idx on lead_events(type, created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
before update on leads
for each row execute function set_updated_at();

alter table leads enable row level security;
alter table lead_intakes enable row level security;
alter table ai_runs enable row level security;
alter table lead_notes enable row level security;
alter table lead_status_events enable row level security;
alter table notifications enable row level security;
alter table lead_events enable row level security;

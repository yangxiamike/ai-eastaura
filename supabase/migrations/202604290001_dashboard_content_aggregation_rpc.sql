create or replace function public.get_dashboard_stats()
returns table (
  total_leads bigint,
  new_leads bigint,
  needs_review bigint,
  high_intent bigint,
  high_risk bigint,
  failed_notifications bigint,
  by_status jsonb,
  by_risk_level jsonb,
  by_source jsonb,
  by_country jsonb
)
language sql
stable
as $$
with lead_counts as (
  select
    count(*)::bigint as total_leads,
    count(*) filter (where status = 'new')::bigint as new_leads,
    count(*) filter (where status = 'needs_review')::bigint as needs_review,
    count(*) filter (where coalesce(intent_score, 0) >= 70)::bigint as high_intent,
    count(*) filter (where risk_level = 'high')::bigint as high_risk,
    jsonb_build_object(
      'new', count(*) filter (where status = 'new'),
      'triaged', count(*) filter (where status = 'triaged'),
      'needs_review', count(*) filter (where status = 'needs_review'),
      'contacted', count(*) filter (where status = 'contacted'),
      'qualified', count(*) filter (where status = 'qualified'),
      'not_fit', count(*) filter (where status = 'not_fit'),
      'closed', count(*) filter (where status = 'closed')
    ) as by_status,
    jsonb_build_object(
      'low', count(*) filter (where risk_level = 'low'),
      'medium', count(*) filter (where risk_level = 'medium'),
      'high', count(*) filter (where risk_level = 'high')
    ) as by_risk_level
  from leads
),
source_counts as (
  select coalesce(jsonb_object_agg(source, cnt), '{}'::jsonb) as by_source
  from (
    select source, count(*)::bigint as cnt
    from leads
    group by source
  ) s
),
country_counts as (
  select coalesce(jsonb_object_agg(country, cnt), '{}'::jsonb) as by_country
  from (
    select country, count(*)::bigint as cnt
    from leads
    where country is not null
    group by country
  ) c
),
notification_counts as (
  select count(*) filter (where delivery_error is not null)::bigint as failed_notifications
  from notifications
)
select
  lc.total_leads,
  lc.new_leads,
  lc.needs_review,
  lc.high_intent,
  lc.high_risk,
  nc.failed_notifications,
  lc.by_status,
  lc.by_risk_level,
  sc.by_source,
  cc.by_country
from lead_counts lc
cross join source_counts sc
cross join country_counts cc
cross join notification_counts nc;
$$;

create or replace function public.get_content_attribution(
  p_campaign_id text default null,
  p_source text default null,
  p_channel text default null,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  total_metrics bigint,
  total_metric_value numeric,
  leads_attributed bigint,
  by_metric_type jsonb,
  by_campaign jsonb,
  by_source jsonb,
  by_channel jsonb
)
language sql
stable
as $$
with filtered as (
  select *
  from content_metrics
  where
    (p_campaign_id is null or campaign_id::text = p_campaign_id)
    and (p_source is null or source = p_source)
    and (p_channel is null or channel::text = p_channel)
    and (p_from is null or occurred_at >= p_from)
    and (p_to is null or occurred_at <= p_to)
),
summary as (
  select
    count(*)::bigint as total_metrics,
    coalesce(sum(metric_value), 0) as total_metric_value,
    count(distinct lead_id) filter (where lead_id is not null)::bigint as leads_attributed
  from filtered
),
metric_type_agg as (
  select coalesce(jsonb_object_agg(metric_type, total_value), '{}'::jsonb) as by_metric_type
  from (
    select metric_type, sum(metric_value) as total_value
    from filtered
    group by metric_type
  ) t
),
campaign_agg as (
  select coalesce(jsonb_object_agg(campaign_id::text, total_value), '{}'::jsonb) as by_campaign
  from (
    select campaign_id, sum(metric_value) as total_value
    from filtered
    group by campaign_id
  ) c
),
source_agg as (
  select coalesce(jsonb_object_agg(source_key, total_value), '{}'::jsonb) as by_source
  from (
    select coalesce(source, 'unknown') as source_key, sum(metric_value) as total_value
    from filtered
    group by coalesce(source, 'unknown')
  ) s
),
channel_agg as (
  select coalesce(jsonb_object_agg(channel_key, total_value), '{}'::jsonb) as by_channel
  from (
    select coalesce(channel::text, 'unknown') as channel_key, sum(metric_value) as total_value
    from filtered
    group by coalesce(channel::text, 'unknown')
  ) ch
)
select
  s.total_metrics,
  s.total_metric_value,
  s.leads_attributed,
  m.by_metric_type,
  c.by_campaign,
  so.by_source,
  ch.by_channel
from summary s
cross join metric_type_agg m
cross join campaign_agg c
cross join source_agg so
cross join channel_agg ch;
$$;

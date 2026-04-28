import type {
  AiRun,
  Campaign,
  ContentAsset,
  ContentAttributionQuery,
  ContentAttributionSummary,
  ContentMetric,
  ContentStatus,
  PublishChannel,
  PublishPost,
  ReviewStatus,
  ReviewTask,
  DashboardStats,
  IntakePayload,
  Lead,
  LeadEvent,
  LeadEventType,
  LeadExportQuery,
  LeadNote,
  LeadStatus,
  LeadStatusEvent,
  NotificationRecord,
  Storyboard,
} from "@/lib/domain/types";
import { getSupabaseAdmin } from "@/lib/server/db/supabase";
import type { EastauraRepository } from "./types";

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  full_name: string;
  email: string;
  country: string | null;
  age_range: string | null;
  goals: string[];
  preferred_timing: string | null;
  budget_usd: number | string | null;
  travel_party_size: number | null;
  free_text: string | null;
  source: string;
  campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  consent_to_contact: boolean;
  latest_ai_run_id: string | null;
  risk_level: Lead["riskLevel"] | null;
  fit_score: number | null;
  intent_score: number | null;
  risk_score: number | null;
  latest_ai_summary: string | null;
};

type AiRunRow = {
  id: string;
  lead_id: string;
  created_at: string;
  agent_key: string;
  provider: string;
  model: string | null;
  skill_refs: AiRun["skillRefs"];
  prompt_snapshot: string;
  output_schema_version: string;
  output: AiRun["output"];
};

type NoteRow = {
  id: string;
  lead_id: string;
  created_at: string;
  body: string;
  author: string;
};

type StatusEventRow = {
  id: string;
  lead_id: string;
  created_at: string;
  from_status: LeadStatus;
  to_status: LeadStatus;
  reason: string | null;
};

type NotificationRow = {
  id: string;
  created_at: string;
  channel: NotificationRecord["channel"];
  type: NotificationRecord["type"];
  title: string;
  body: string;
  lead_id: string;
  delivered: boolean;
  delivered_at: string | null;
  delivery_error: string | null;
};

type LeadEventRow = {
  id: string;
  lead_id: string;
  created_at: string;
  type: LeadEventType;
  actor: LeadEvent["actor"];
  metadata: Record<string, unknown>;
};

type CampaignRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  objective: string;
  status: ContentStatus;
  target_audience: string | null;
  source: string | null;
  owner: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_usd: number | string | null;
  tags: string[];
};

type ContentAssetRow = {
  id: string;
  campaign_id: string;
  created_at: string;
  updated_at: string;
  status: ContentStatus;
  title: string;
  format: ContentAsset["format"];
  channel: PublishChannel;
  brief: string | null;
  body: string | null;
  call_to_action: string | null;
  landing_url: string | null;
  source: string | null;
  tags: string[];
};

type StoryboardRow = {
  id: string;
  campaign_id: string;
  asset_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  status: ContentStatus;
  scenes: Storyboard["scenes"];
  notes: string | null;
};

type ReviewTaskRow = {
  id: string;
  campaign_id: string;
  asset_id: string;
  created_at: string;
  updated_at: string;
  status: ReviewStatus;
  reviewer: string;
  notes: string | null;
  due_at: string | null;
  decided_at: string | null;
};

type PublishPostRow = {
  id: string;
  campaign_id: string;
  asset_id: string;
  created_at: string;
  updated_at: string;
  channel: PublishChannel;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  post_url: string | null;
  external_post_id: string | null;
  tracking_code: string | null;
};

type ContentMetricRow = {
  id: string;
  campaign_id: string;
  asset_id: string | null;
  publish_post_id: string | null;
  lead_id: string | null;
  created_at: string;
  occurred_at: string;
  source: string | null;
  channel: PublishChannel | null;
  metric_type: string;
  metric_value: number | string;
  metadata: Record<string, unknown>;
};

export const supabaseRepository: EastauraRepository = {
  async createLead(payload) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        full_name: payload.fullName,
        email: payload.email,
        country: payload.country,
        age_range: payload.ageRange,
        goals: payload.goals,
        preferred_timing: payload.preferredTiming,
        budget_usd: payload.budgetUsd,
        travel_party_size: payload.travelPartySize,
        free_text: payload.freeText,
        source: payload.source ?? "direct",
        campaign: payload.campaign,
        utm_source: payload.utmSource,
        utm_medium: payload.utmMedium,
        utm_campaign: payload.utmCampaign,
        utm_content: payload.utmContent,
        consent_to_contact: payload.consentToContact,
      })
      .select("*")
      .single<LeadRow>();

    if (error) {
      throw new Error(error.message);
    }

    const lead = mapLeadRow(data);
    const { error: intakeError } = await supabase.from("lead_intakes").insert({
      lead_id: lead.id,
      raw_payload: payload,
    });

    if (intakeError) {
      throw new Error(intakeError.message);
    }

    await this.createLeadEvent({
      leadId: lead.id,
      type: "lead_created",
      metadata: {
        source: lead.source,
        campaign: lead.campaign,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmContent: lead.utmContent,
        country: lead.country,
      },
    });

    return lead;
  },

  async listLeads(query) {
    let builder = getSupabaseAdmin()
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.status) {
      builder = builder.eq("status", query.status);
    }

    if (query.riskLevel) {
      builder = builder.eq("risk_level", query.riskLevel);
    }

    if (query.source) {
      builder = builder.eq("source", query.source);
    }

    if (query.country) {
      builder = builder.eq("country", query.country);
    }

    if (query.q) {
      const escapedQuery = query.q.replaceAll("%", "\\%").replaceAll("_", "\\_");
      builder = builder.or(
        `full_name.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%,free_text.ilike.%${escapedQuery}%`,
      );
    }

    const { data, error, count } = await builder.returns<LeadRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return {
      leads: data.map(mapLeadRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async exportLeads(query: LeadExportQuery) {
    let builder = getSupabaseAdmin()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(query.limit);

    if (query.status) {
      builder = builder.eq("status", query.status);
    }

    if (query.riskLevel) {
      builder = builder.eq("risk_level", query.riskLevel);
    }

    if (query.source) {
      builder = builder.eq("source", query.source);
    }

    if (query.country) {
      builder = builder.eq("country", query.country);
    }

    if (query.q) {
      const escapedQuery = query.q.replaceAll("%", "\\%").replaceAll("_", "\\_");
      builder = builder.or(
        `full_name.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%,free_text.ilike.%${escapedQuery}%`,
      );
    }

    const { data, error } = await builder.returns<LeadRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapLeadRow);
  },

  async getLead(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle<LeadRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapLeadRow(data) : undefined;
  },

  async updateLeadStatus(id, status, reason) {
    const current = await this.getLead(id);

    if (!current) {
      throw new Error("Lead not found.");
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single<LeadRow>();

    if (error) {
      throw new Error(error.message);
    }

    const { error: eventError } = await supabase.from("lead_status_events").insert({
      lead_id: id,
      from_status: current.status,
      to_status: status,
      reason,
    });

    if (eventError) {
      throw new Error(eventError.message);
    }

    await this.createLeadEvent({
      leadId: id,
      type: "status_changed",
      actor: "founder",
      metadata: {
        from: current.status,
        to: status,
        reason,
      },
    });

    return mapLeadRow(data);
  },

  async saveAiRun(aiRun) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ai_runs")
      .insert({
        id: aiRun.id,
        lead_id: aiRun.leadId,
        created_at: aiRun.createdAt,
        agent_key: aiRun.agentKey,
        provider: aiRun.provider,
        model: aiRun.model,
        skill_refs: aiRun.skillRefs,
        prompt_snapshot: aiRun.promptSnapshot,
        output_schema_version: aiRun.outputSchemaVersion,
        output: aiRun.output,
      })
      .select("*")
      .single<AiRunRow>();

    if (error) {
      throw new Error(error.message);
    }

    const { error: leadError } = await supabase
      .from("leads")
      .update({
        latest_ai_run_id: data.id,
        status: aiRun.output.humanReviewRequired ? "needs_review" : "triaged",
        risk_level: aiRun.output.riskLevel,
        fit_score: aiRun.output.fitScore,
        intent_score: aiRun.output.intentScore,
        risk_score: aiRun.output.riskScore,
        latest_ai_summary: aiRun.output.summary,
      })
      .eq("id", aiRun.leadId);

    if (leadError) {
      throw new Error(leadError.message);
    }

    await this.createLeadEvent({
      leadId: aiRun.leadId,
      type: "triage_run",
      actor: "agent",
      metadata: {
        aiRunId: data.id,
        provider: aiRun.provider,
        model: aiRun.model,
        riskLevel: aiRun.output.riskLevel,
        intentScore: aiRun.output.intentScore,
      },
    });

    return mapAiRunRow(data);
  },

  async getAiRunsForLead(leadId) {
    const { data, error } = await getSupabaseAdmin()
      .from("ai_runs")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<AiRunRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapAiRunRow);
  },

  async createLeadNote(leadId, body, author = "founder") {
    const { data, error } = await getSupabaseAdmin()
      .from("lead_notes")
      .insert({
        lead_id: leadId,
        body,
        author,
      })
      .select("*")
      .single<NoteRow>();

    if (error) {
      throw new Error(normalizeMissingLeadError(error.message));
    }

    await this.createLeadEvent({
      leadId,
      type: "note_added",
      actor: "founder",
      metadata: {
        noteId: data.id,
        author,
      },
    });

    return mapNoteRow(data);
  },

  async getLeadNotes(leadId) {
    const { data, error } = await getSupabaseAdmin()
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<NoteRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapNoteRow);
  },

  async getLeadStatusEvents(leadId) {
    const { data, error } = await getSupabaseAdmin()
      .from("lead_status_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<StatusEventRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapStatusEventRow);
  },

  async createNotification(notification) {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .insert({
        channel: notification.channel,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        lead_id: notification.leadId,
        delivered: notification.channel === "in_app",
        delivered_at:
          notification.channel === "in_app" ? new Date().toISOString() : null,
      })
      .select("*")
      .single<NotificationRow>();

    if (error) {
      throw new Error(error.message);
    }

    await this.createLeadEvent({
      leadId: data.lead_id,
      type: "notification_created",
      metadata: {
        notificationId: data.id,
        channel: data.channel,
        notificationType: data.type,
      },
    });

    return mapNotificationRow(data);
  },

  async updateNotificationDelivery(id, delivery) {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .update({
        delivered: delivery.delivered,
        delivered_at: delivery.deliveredAt,
        delivery_error: delivery.deliveryError,
      })
      .eq("id", id)
      .select("*")
      .single<NotificationRow>();

    if (error) {
      throw new Error(error.message);
    }

    await this.createLeadEvent({
      leadId: data.lead_id,
      type: delivery.delivered ? "notification_delivered" : "notification_failed",
      metadata: {
        notificationId: data.id,
        channel: data.channel,
        deliveryError: delivery.deliveryError,
      },
    });

    return mapNotificationRow(data);
  },

  async getNotification(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .select("*")
      .eq("id", id)
      .maybeSingle<NotificationRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapNotificationRow(data) : undefined;
  },

  async listNotifications() {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<NotificationRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapNotificationRow);
  },

  async createLeadEvent(event) {
    const { data, error } = await getSupabaseAdmin()
      .from("lead_events")
      .insert({
        lead_id: event.leadId,
        type: event.type,
        actor: event.actor ?? "system",
        metadata: event.metadata ?? {},
      })
      .select("*")
      .single<LeadEventRow>();

    if (error) {
      throw new Error(error.message);
    }

    return mapLeadEventRow(data);
  },

  async getLeadEventsForLead(leadId) {
    const { data, error } = await getSupabaseAdmin()
      .from("lead_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<LeadEventRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data.map(mapLeadEventRow);
  },

  async createCampaign(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("campaigns")
      .insert({
        name: payload.name,
        objective: payload.objective,
        target_audience: payload.targetAudience,
        source: payload.source,
        owner: payload.owner,
        start_date: payload.startDate,
        end_date: payload.endDate,
        budget_usd: payload.budgetUsd,
        tags: payload.tags ?? [],
      })
      .select("*")
      .single<CampaignRow>();

    if (error) {
      throw new Error(error.message);
    }

    return mapCampaignRow(data);
  },

  async getCampaign(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle<CampaignRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapCampaignRow(data) : undefined;
  },

  async listCampaigns(query) {
    let builder = getSupabaseAdmin()
      .from("campaigns")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.status) {
      builder = builder.eq("status", query.status);
    }

    if (query.source) {
      builder = builder.eq("source", query.source);
    }

    if (query.q) {
      const escapedQuery = query.q.replaceAll("%", "\\%").replaceAll("_", "\\_");
      builder = builder.or(
        `name.ilike.%${escapedQuery}%,objective.ilike.%${escapedQuery}%,target_audience.ilike.%${escapedQuery}%`,
      );
    }

    const { data, error, count } = await builder.returns<CampaignRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return {
      campaigns: data.map(mapCampaignRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async updateCampaign(id, payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("campaigns")
      .update(
        stripUndefined({
          name: payload.name,
          objective: payload.objective,
          status: payload.status,
          target_audience: payload.targetAudience,
          source: payload.source,
          owner: payload.owner,
          start_date: payload.startDate,
          end_date: payload.endDate,
          budget_usd: payload.budgetUsd,
          tags: payload.tags,
        }),
      )
      .eq("id", id)
      .select("*")
      .single<CampaignRow>();

    if (error) {
      throw new Error(error.message);
    }

    return mapCampaignRow(data);
  },

  async createContentAsset(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("content_assets")
      .insert({
        campaign_id: payload.campaignId,
        title: payload.title,
        format: payload.format,
        channel: payload.channel,
        status: payload.brief ? "briefed" : "idea",
        brief: payload.brief,
        body: payload.body,
        call_to_action: payload.callToAction,
        landing_url: payload.landingUrl,
        source: payload.source,
        tags: payload.tags ?? [],
      })
      .select("*")
      .single<ContentAssetRow>();

    if (error) {
      throw new Error(normalizeContentForeignKeyError(error.message));
    }

    return mapContentAssetRow(data);
  },

  async getContentAsset(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("content_assets")
      .select("*")
      .eq("id", id)
      .maybeSingle<ContentAssetRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapContentAssetRow(data) : undefined;
  },

  async listContentAssets(query) {
    let builder = getSupabaseAdmin()
      .from("content_assets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.status) builder = builder.eq("status", query.status);
    if (query.channel) builder = builder.eq("channel", query.channel);
    if (query.source) builder = builder.eq("source", query.source);
    if (query.q) {
      const escapedQuery = query.q.replaceAll("%", "\\%").replaceAll("_", "\\_");
      builder = builder.or(
        `title.ilike.%${escapedQuery}%,brief.ilike.%${escapedQuery}%,body.ilike.%${escapedQuery}%`,
      );
    }

    const { data, error, count } = await builder.returns<ContentAssetRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return {
      assets: data.map(mapContentAssetRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async updateContentAsset(id, payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("content_assets")
      .update(
        stripUndefined({
          campaign_id: payload.campaignId,
          title: payload.title,
          status: payload.status,
          format: payload.format,
          channel: payload.channel,
          brief: payload.brief,
          body: payload.body,
          call_to_action: payload.callToAction,
          landing_url: payload.landingUrl,
          source: payload.source,
          tags: payload.tags,
        }),
      )
      .eq("id", id)
      .select("*")
      .single<ContentAssetRow>();

    if (error) {
      throw new Error(normalizeContentForeignKeyError(error.message));
    }

    return mapContentAssetRow(data);
  },

  async createStoryboard(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("storyboards")
      .insert({
        campaign_id: payload.campaignId,
        asset_id: payload.assetId,
        title: payload.title,
        scenes: payload.scenes,
        notes: payload.notes,
      })
      .select("*")
      .single<StoryboardRow>();

    if (error) {
      throw new Error(normalizeContentForeignKeyError(error.message));
    }

    return mapStoryboardRow(data);
  },

  async getStoryboard(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("storyboards")
      .select("*")
      .eq("id", id)
      .maybeSingle<StoryboardRow>();

    if (error) throw new Error(error.message);
    return data ? mapStoryboardRow(data) : undefined;
  },

  async listStoryboards(query) {
    let builder = getSupabaseAdmin()
      .from("storyboards")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.assetId) builder = builder.eq("asset_id", query.assetId);
    if (query.status) builder = builder.eq("status", query.status);

    const { data, error, count } = await builder.returns<StoryboardRow[]>();

    if (error) throw new Error(error.message);

    return {
      storyboards: data.map(mapStoryboardRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async updateStoryboard(id, payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("storyboards")
      .update(
        stripUndefined({
          campaign_id: payload.campaignId,
          asset_id: payload.assetId,
          title: payload.title,
          status: payload.status,
          scenes: payload.scenes,
          notes: payload.notes,
        }),
      )
      .eq("id", id)
      .select("*")
      .single<StoryboardRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapStoryboardRow(data);
  },

  async createReviewTask(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("review_tasks")
      .insert({
        campaign_id: payload.campaignId,
        asset_id: payload.assetId,
        reviewer: payload.reviewer,
        notes: payload.notes,
        due_at: payload.dueAt,
      })
      .select("*")
      .single<ReviewTaskRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapReviewTaskRow(data);
  },

  async getReviewTask(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("review_tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle<ReviewTaskRow>();

    if (error) throw new Error(error.message);
    return data ? mapReviewTaskRow(data) : undefined;
  },

  async listReviewTasks(query) {
    let builder = getSupabaseAdmin()
      .from("review_tasks")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.assetId) builder = builder.eq("asset_id", query.assetId);
    if (query.status) builder = builder.eq("status", query.status);
    if (query.reviewer) builder = builder.eq("reviewer", query.reviewer);

    const { data, error, count } = await builder.returns<ReviewTaskRow[]>();

    if (error) throw new Error(error.message);

    return {
      reviewTasks: data.map(mapReviewTaskRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async updateReviewTask(id, payload) {
    const existing = await this.getReviewTask(id);
    const decidedAt =
      payload.decidedAt ??
      (payload.status &&
      payload.status !== "open" &&
      existing?.status !== payload.status
        ? new Date().toISOString()
        : undefined);
    const { data, error } = await getSupabaseAdmin()
      .from("review_tasks")
      .update(
        stripUndefined({
          campaign_id: payload.campaignId,
          asset_id: payload.assetId,
          reviewer: payload.reviewer,
          status: payload.status,
          notes: payload.notes,
          due_at: payload.dueAt,
          decided_at: decidedAt,
        }),
      )
      .eq("id", id)
      .select("*")
      .single<ReviewTaskRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapReviewTaskRow(data);
  },

  async createPublishPost(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("publish_posts")
      .insert({
        campaign_id: payload.campaignId,
        asset_id: payload.assetId,
        channel: payload.channel,
        status: payload.publishedAt ? "published" : "scheduled",
        scheduled_at: payload.scheduledAt,
        published_at: payload.publishedAt,
        post_url: payload.postUrl,
        external_post_id: payload.externalPostId,
        tracking_code: payload.trackingCode,
      })
      .select("*")
      .single<PublishPostRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapPublishPostRow(data);
  },

  async getPublishPost(id) {
    const { data, error } = await getSupabaseAdmin()
      .from("publish_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle<PublishPostRow>();

    if (error) throw new Error(error.message);
    return data ? mapPublishPostRow(data) : undefined;
  },

  async listPublishPosts(query) {
    let builder = getSupabaseAdmin()
      .from("publish_posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.assetId) builder = builder.eq("asset_id", query.assetId);
    if (query.channel) builder = builder.eq("channel", query.channel);
    if (query.status) builder = builder.eq("status", query.status);
    if (query.trackingCode) builder = builder.eq("tracking_code", query.trackingCode);

    const { data, error, count } = await builder.returns<PublishPostRow[]>();

    if (error) throw new Error(error.message);

    return {
      publishPosts: data.map(mapPublishPostRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async updatePublishPost(id, payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("publish_posts")
      .update(
        stripUndefined({
          campaign_id: payload.campaignId,
          asset_id: payload.assetId,
          channel: payload.channel,
          status: payload.status,
          scheduled_at: payload.scheduledAt,
          published_at: payload.publishedAt,
          post_url: payload.postUrl,
          external_post_id: payload.externalPostId,
          tracking_code: payload.trackingCode,
        }),
      )
      .eq("id", id)
      .select("*")
      .single<PublishPostRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapPublishPostRow(data);
  },

  async createContentMetric(payload) {
    const { data, error } = await getSupabaseAdmin()
      .from("content_metrics")
      .insert({
        campaign_id: payload.campaignId,
        asset_id: payload.assetId,
        publish_post_id: payload.publishPostId,
        lead_id: payload.leadId,
        occurred_at: payload.occurredAt ?? new Date().toISOString(),
        source: payload.source,
        channel: payload.channel,
        metric_type: payload.metricType,
        metric_value: payload.metricValue,
        metadata: payload.metadata ?? {},
      })
      .select("*")
      .single<ContentMetricRow>();

    if (error) throw new Error(normalizeContentForeignKeyError(error.message));
    return mapContentMetricRow(data);
  },

  async listContentMetrics(query) {
    let builder = getSupabaseAdmin()
      .from("content_metrics")
      .select("*", { count: "exact" })
      .order("occurred_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.assetId) builder = builder.eq("asset_id", query.assetId);
    if (query.publishPostId) {
      builder = builder.eq("publish_post_id", query.publishPostId);
    }
    if (query.leadId) builder = builder.eq("lead_id", query.leadId);
    if (query.source) builder = builder.eq("source", query.source);
    if (query.channel) builder = builder.eq("channel", query.channel);
    if (query.metricType) builder = builder.eq("metric_type", query.metricType);
    if (query.from) builder = builder.gte("occurred_at", query.from);
    if (query.to) builder = builder.lte("occurred_at", query.to);

    const { data, error, count } = await builder.returns<ContentMetricRow[]>();

    if (error) throw new Error(error.message);

    return {
      metrics: data.map(mapContentMetricRow),
      total: count ?? data.length,
      limit: query.limit,
      offset: query.offset,
    };
  },

  async getContentAttribution(query) {
    let builder = getSupabaseAdmin()
      .from("content_metrics")
      .select("*")
      .limit(10000);

    if (query.campaignId) builder = builder.eq("campaign_id", query.campaignId);
    if (query.source) builder = builder.eq("source", query.source);
    if (query.channel) builder = builder.eq("channel", query.channel);
    if (query.from) builder = builder.gte("occurred_at", query.from);
    if (query.to) builder = builder.lte("occurred_at", query.to);

    const { data, error } = await builder.returns<ContentMetricRow[]>();

    if (error) throw new Error(error.message);

    return buildContentAttribution(
      data.map(mapContentMetricRow),
      query,
    );
  },

  async getDashboardStats() {
    const [leadsResult, notificationsResult] = await Promise.all([
      getSupabaseAdmin().from("leads").select("*").limit(10000).returns<LeadRow[]>(),
      getSupabaseAdmin()
        .from("notifications")
        .select("*")
        .limit(10000)
        .returns<NotificationRow[]>(),
    ]);

    if (leadsResult.error) {
      throw new Error(leadsResult.error.message);
    }

    if (notificationsResult.error) {
      throw new Error(notificationsResult.error.message);
    }

    return buildDashboardStats(
      leadsResult.data.map(mapLeadRow),
      notificationsResult.data.map(mapNotificationRow),
    );
  },
};

function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    country: row.country ?? undefined,
    ageRange: row.age_range ?? undefined,
    goals: row.goals,
    preferredTiming: row.preferred_timing ?? undefined,
    budgetUsd: row.budget_usd === null ? undefined : Number(row.budget_usd),
    travelPartySize: row.travel_party_size ?? undefined,
    freeText: row.free_text ?? undefined,
    source: row.source,
    campaign: row.campaign ?? undefined,
    utmSource: row.utm_source ?? undefined,
    utmMedium: row.utm_medium ?? undefined,
    utmCampaign: row.utm_campaign ?? undefined,
    utmContent: row.utm_content ?? undefined,
    consentToContact: row.consent_to_contact,
    latestAiRunId: row.latest_ai_run_id ?? undefined,
    riskLevel: row.risk_level ?? undefined,
    fitScore: row.fit_score ?? undefined,
    intentScore: row.intent_score ?? undefined,
    riskScore: row.risk_score ?? undefined,
    latestAiSummary: row.latest_ai_summary ?? undefined,
  };
}

function mapAiRunRow(row: AiRunRow): AiRun {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    agentKey: row.agent_key,
    provider: row.provider,
    model: row.model ?? undefined,
    skillRefs: row.skill_refs,
    promptSnapshot: row.prompt_snapshot,
    outputSchemaVersion: row.output_schema_version,
    output: row.output,
  };
}

function mapNoteRow(row: NoteRow): LeadNote {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    body: row.body,
    author: row.author,
  };
}

function mapStatusEventRow(row: StatusEventRow): LeadStatusEvent {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    from: row.from_status,
    to: row.to_status,
    reason: row.reason ?? undefined,
  };
}

function mapNotificationRow(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    channel: row.channel,
    type: row.type,
    title: row.title,
    body: row.body,
    leadId: row.lead_id,
    delivered: row.delivered,
    deliveredAt: row.delivered_at ?? undefined,
    deliveryError: row.delivery_error ?? undefined,
  };
}

function mapLeadEventRow(row: LeadEventRow): LeadEvent {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    type: row.type,
    actor: row.actor,
    metadata: row.metadata,
  };
}

function mapCampaignRow(row: CampaignRow): Campaign {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    objective: row.objective,
    status: row.status,
    targetAudience: row.target_audience ?? undefined,
    source: row.source ?? undefined,
    owner: row.owner ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    budgetUsd: row.budget_usd === null ? undefined : Number(row.budget_usd),
    tags: row.tags,
  };
}

function mapContentAssetRow(row: ContentAssetRow): ContentAsset {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    title: row.title,
    format: row.format,
    channel: row.channel,
    brief: row.brief ?? undefined,
    body: row.body ?? undefined,
    callToAction: row.call_to_action ?? undefined,
    landingUrl: row.landing_url ?? undefined,
    source: row.source ?? undefined,
    tags: row.tags,
  };
}

function mapStoryboardRow(row: StoryboardRow): Storyboard {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    assetId: row.asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    status: row.status,
    scenes: row.scenes,
    notes: row.notes ?? undefined,
  };
}

function mapReviewTaskRow(row: ReviewTaskRow): ReviewTask {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    assetId: row.asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    reviewer: row.reviewer,
    notes: row.notes ?? undefined,
    dueAt: row.due_at ?? undefined,
    decidedAt: row.decided_at ?? undefined,
  };
}

function mapPublishPostRow(row: PublishPostRow): PublishPost {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    assetId: row.asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    channel: row.channel,
    status: row.status,
    scheduledAt: row.scheduled_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    postUrl: row.post_url ?? undefined,
    externalPostId: row.external_post_id ?? undefined,
    trackingCode: row.tracking_code ?? undefined,
  };
}

function mapContentMetricRow(row: ContentMetricRow): ContentMetric {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    assetId: row.asset_id ?? undefined,
    publishPostId: row.publish_post_id ?? undefined,
    leadId: row.lead_id ?? undefined,
    createdAt: row.created_at,
    occurredAt: row.occurred_at,
    source: row.source ?? undefined,
    channel: row.channel ?? undefined,
    metricType: row.metric_type,
    metricValue: Number(row.metric_value),
    metadata: row.metadata,
  };
}

function buildDashboardStats(
  leads: Lead[],
  notifications: NotificationRecord[],
): DashboardStats {
  const byStatus = {
    new: 0,
    triaged: 0,
    needs_review: 0,
    contacted: 0,
    qualified: 0,
    not_fit: 0,
    closed: 0,
  };
  const byRiskLevel = {
    low: 0,
    medium: 0,
    high: 0,
  };
  const bySource: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const lead of leads) {
    byStatus[lead.status] += 1;

    if (lead.riskLevel) {
      byRiskLevel[lead.riskLevel] += 1;
    }

    bySource[lead.source] = (bySource[lead.source] ?? 0) + 1;

    if (lead.country) {
      byCountry[lead.country] = (byCountry[lead.country] ?? 0) + 1;
    }
  }

  return {
    totalLeads: leads.length,
    newLeads: byStatus.new,
    needsReview: byStatus.needs_review,
    highIntent: leads.filter((lead) => (lead.intentScore ?? 0) >= 70).length,
    highRisk: byRiskLevel.high,
    failedNotifications: notifications.filter(
      (notification) => notification.deliveryError,
    ).length,
    byStatus,
    byRiskLevel,
    bySource,
    byCountry,
  };
}

function buildContentAttribution(
  metrics: ContentMetric[],
  query: ContentAttributionQuery,
): ContentAttributionSummary {
  const leadIds = new Set(metrics.map((metric) => metric.leadId).filter(Boolean));

  return {
    campaignId: query.campaignId,
    source: query.source,
    channel: query.channel,
    totalMetrics: metrics.length,
    totalMetricValue: sumBy(metrics, (metric) => metric.metricValue),
    leadsAttributed: leadIds.size,
    byMetricType: groupMetricValues(metrics, (metric) => metric.metricType),
    byCampaign: groupMetricValues(metrics, (metric) => metric.campaignId),
    bySource: groupMetricValues(metrics, (metric) => metric.source ?? "unknown"),
    byChannel: groupMetricValues(metrics, (metric) => metric.channel ?? "unknown"),
  };
}

function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;
}

function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function groupMetricValues(
  metrics: ContentMetric[],
  keySelector: (metric: ContentMetric) => string,
): Record<string, number> {
  const grouped: Record<string, number> = {};

  for (const metric of metrics) {
    const key = keySelector(metric);
    grouped[key] = (grouped[key] ?? 0) + metric.metricValue;
  }

  return grouped;
}

function normalizeMissingLeadError(message: string): string {
  return message.includes("violates foreign key constraint") ? "Lead not found." : message;
}

function normalizeContentForeignKeyError(message: string): string {
  if (!message.includes("violates foreign key constraint")) {
    return message;
  }

  if (message.includes("campaign")) {
    return "Campaign not found.";
  }

  if (message.includes("asset")) {
    return "Content asset not found.";
  }

  if (message.includes("publish_post")) {
    return "Publish post not found.";
  }

  if (message.includes("lead")) {
    return "Lead not found.";
  }

  return message;
}

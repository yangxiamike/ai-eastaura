import type {
  AiRun,
  Campaign,
  CampaignListQuery,
  CampaignListResult,
  ContentAsset,
  ContentAssetListQuery,
  ContentAssetListResult,
  ContentAttributionQuery,
  ContentAttributionSummary,
  ContentMetric,
  ContentMetricListQuery,
  ContentMetricListResult,
  CreateCampaignInput,
  CreateContentAssetInput,
  CreateContentMetricInput,
  CreatePublishPostInput,
  CreateReviewTaskInput,
  CreateStoryboardInput,
  DashboardStats,
  IntakePayload,
  Lead,
  LeadEvent,
  LeadEventType,
  LeadExportQuery,
  LeadListQuery,
  LeadListResult,
  LeadNote,
  LeadStatus,
  LeadStatusEvent,
  NotificationRecord,
  PublishPost,
  PublishPostListQuery,
  PublishPostListResult,
  ReviewTask,
  ReviewTaskListQuery,
  ReviewTaskListResult,
  Storyboard,
  StoryboardListQuery,
  StoryboardListResult,
  UpdateCampaignInput,
  UpdateContentAssetInput,
  UpdatePublishPostInput,
  UpdateReviewTaskInput,
  UpdateStoryboardInput,
} from "@/lib/domain/types";

export type EastauraRepository = {
  createLead(payload: IntakePayload): Promise<Lead>;
  listLeads(query: LeadListQuery): Promise<LeadListResult>;
  exportLeads(query: LeadExportQuery): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  updateLeadStatus(id: string, status: LeadStatus, reason?: string): Promise<Lead>;
  saveAiRun(aiRun: AiRun): Promise<AiRun>;
  getAiRunsForLead(leadId: string): Promise<AiRun[]>;
  createLeadNote(leadId: string, body: string, author?: string): Promise<LeadNote>;
  getLeadNotes(leadId: string): Promise<LeadNote[]>;
  getLeadStatusEvents(leadId: string): Promise<LeadStatusEvent[]>;
  createNotification(
    notification: Omit<NotificationRecord, "id" | "createdAt" | "delivered">,
  ): Promise<NotificationRecord>;
  updateNotificationDelivery(
    id: string,
    delivery: {
      delivered: boolean;
      deliveredAt?: string;
      deliveryError?: string;
    },
  ): Promise<NotificationRecord>;
  getNotification(id: string): Promise<NotificationRecord | undefined>;
  listNotifications(): Promise<NotificationRecord[]>;
  createLeadEvent(event: {
    leadId: string;
    type: LeadEventType;
    actor?: LeadEvent["actor"];
    metadata?: Record<string, unknown>;
  }): Promise<LeadEvent>;
  getLeadEventsForLead(leadId: string): Promise<LeadEvent[]>;
  getDashboardStats(): Promise<DashboardStats>;
  createCampaign(payload: CreateCampaignInput): Promise<Campaign>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  listCampaigns(query: CampaignListQuery): Promise<CampaignListResult>;
  updateCampaign(id: string, payload: UpdateCampaignInput): Promise<Campaign>;
  createContentAsset(payload: CreateContentAssetInput): Promise<ContentAsset>;
  getContentAsset(id: string): Promise<ContentAsset | undefined>;
  listContentAssets(
    query: ContentAssetListQuery,
  ): Promise<ContentAssetListResult>;
  updateContentAsset(
    id: string,
    payload: UpdateContentAssetInput,
  ): Promise<ContentAsset>;
  createStoryboard(payload: CreateStoryboardInput): Promise<Storyboard>;
  getStoryboard(id: string): Promise<Storyboard | undefined>;
  listStoryboards(query: StoryboardListQuery): Promise<StoryboardListResult>;
  updateStoryboard(
    id: string,
    payload: UpdateStoryboardInput,
  ): Promise<Storyboard>;
  createReviewTask(payload: CreateReviewTaskInput): Promise<ReviewTask>;
  getReviewTask(id: string): Promise<ReviewTask | undefined>;
  listReviewTasks(query: ReviewTaskListQuery): Promise<ReviewTaskListResult>;
  updateReviewTask(
    id: string,
    payload: UpdateReviewTaskInput,
  ): Promise<ReviewTask>;
  createPublishPost(payload: CreatePublishPostInput): Promise<PublishPost>;
  getPublishPost(id: string): Promise<PublishPost | undefined>;
  listPublishPosts(query: PublishPostListQuery): Promise<PublishPostListResult>;
  updatePublishPost(
    id: string,
    payload: UpdatePublishPostInput,
  ): Promise<PublishPost>;
  createContentMetric(payload: CreateContentMetricInput): Promise<ContentMetric>;
  listContentMetrics(
    query: ContentMetricListQuery,
  ): Promise<ContentMetricListResult>;
  getContentAttribution(
    query: ContentAttributionQuery,
  ): Promise<ContentAttributionSummary>;
};

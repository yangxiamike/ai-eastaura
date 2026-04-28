export interface Lead {
  id: string;
  name: string;
  email: string;
  country: string;
  age: number;
  avatar: string;
  primaryGoals: string[];
  source: string;
  campaign: string;
  status:
    | "new"
    | "triaged"
    | "needs_review"
    | "contacted"
    | "qualified"
    | "consultation_booked"
    | "proposal_sent"
    | "won"
    | "not_fit"
    | "nurture";
  riskLevel: "low" | "medium" | "high";
  intentScore: number;
  lastActivity: string;
  nextAction: string;
  budget?: string;
  aiSummary?: string;
  riskNotes?: string[];
  intakeDetails?: {
    goals: string;
    concerns: string;
    timeline: string;
    previousExperience: string;
    medicalConditions: string[];
    medications: string[];
    preferredContact: string;
  };
  timeline?: { date: string; action: string; by: string }[];
  sourceAttribution?: {
    campaign: string;
    contentItem: string;
    channel: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  type: "short_video_script" | "linkedin_post" | "newsletter" | "blog" | "reels_script";
  channel: string;
  campaign: string;
  cta: string;
  complianceStatus: "pending" | "approved" | "flagged" | "rejected";
  publishStatus: "draft" | "review" | "scheduled" | "published" | "idea";
  sourceCode: string;
  performanceNotes?: string;
  createdAt: string;
  updatedAt: string;
  body?: string;
  topics?: string[];
  platforms?: string[];
  thumbnail?: string;
}

export interface ReviewTask {
  id: string;
  type: "lead_risk_review" | "followup_email_approval" | "content_compliance" | "script_approval" | "notification_priority";
  priority: "low" | "medium" | "high" | "urgent";
  relatedObject: string;
  relatedObjectId: string;
  aiRecommendation: string;
  status: "open" | "pending" | "approved" | "needs_revision" | "rejected" | "edited";
  createdAt: string;
  details?: string;
}

export interface Notification {
  id: string;
  type: "new_lead" | "high_risk_alert" | "followup_reminder" | "daily_brief" | "failed_email" | "failed_ai_task";
  title: string;
  message: string;
  status: "pending" | "sent" | "failed" | "skipped";
  createdAt: string;
  read: boolean;
  relatedId?: string;
}

export interface SkillFile {
  id: string;
  name: string;
  category: string;
  content: string;
  updatedAt: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  channel: string;
  day: number; // 0-6 Mon-Sun
  time: string;
  status: "scheduled" | "published" | "draft" | "pending" | "planned";
  thumbnail?: string;
  type: string;
}

export interface Scene {
  number: number;
  title: string;
  thumbnail: string;
  caption: string;
  narration: string;
  duration: string;
  imagePrompt?: string;
  videoPrompt?: string;
}

export interface ChannelPerformance {
  channel: string;
  contentCount: number;
  clicks: number;
  clickRate: string;
  leads: number;
  leadRate: string;
  highIntent: number;
  suggestion: string;
}

export interface AttributionSummary {
  totalMetrics: number;
  totalMetricValue: number;
  leadsAttributed: number;
  byMetricType: Record<string, number>;
  byCampaign: Record<string, number>;
  bySource: Record<string, number>;
  byChannel: Record<string, number>;
}

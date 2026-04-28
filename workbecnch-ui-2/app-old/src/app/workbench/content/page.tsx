"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Lightbulb,
  AlertTriangle,
  Moon,
  Leaf,
  Shield,
  MessageCircle,
  CalendarDays,
  User,
  RotateCcw,
  X,
  ArrowRight,
} from "lucide-react";
import { contentItems } from "@/lib/workbench/mock-data";
import {
  createContentAsset,
  generateContentScript,
  getContentAssets,
  runContentComplianceReview,
} from "@/lib/workbench/client-api";
import { StatusBadge } from "@/components/workbench/StatusBadge";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import { FocusListPanel } from "@/components/workbench/FocusListPanel";
import type { ContentItem } from "@/lib/workbench/types";

const channels = ["All", "TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn", "Newsletter", "Blog"];

const initialTopics = [
  { icon: Moon, label: "Sleep Reset", count: 4 },
  { icon: Leaf, label: "Stress Recovery", count: 3 },
  { icon: Shield, label: "No Cure Promise", count: 2 },
  { icon: MessageCircle, label: "No Chinese Required", count: 2 },
  { icon: CalendarDays, label: "Shanghai -> Hangzhou", count: 3 },
  { icon: User, label: "Founder Trust", count: 2 },
];

export default function ContentStudio() {
  const { t } = useLanguage();
  const [activeChannel, setActiveChannel] = useState("All");
  const [activeTab, setActiveTab] = useState("topic-bank");
  const [localItems, setLocalItems] = useState(contentItems);
  const [topicItems, setTopicItems] = useState(initialTopics);
  const [showComposer, setShowComposer] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftChannel, setDraftChannel] = useState("Instagram Reels");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState(localItems[0]?.id ?? "");
  const [showWorkspace, setShowWorkspace] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getContentAssets()
      .then((payload) => {
        if (cancelled || !payload.assets?.length) return;
        setLocalItems(payload.assets);
        setSelectedDraftId(payload.assets[0]?.id ?? "");
        if (payload.usingFallback) {
          setFeedback(t("Using fallback content drafts because root API is unavailable."));
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : t("Failed to load content assets.")));

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(timer);
  }, [feedback]);

  const createLocalDraft = async ({
    title,
    channel,
    type,
    sourceCodePrefix,
    successMessage,
  }: {
    title: string;
    channel: string;
    type: "short_video_script" | "linkedin_post" | "newsletter" | "blog" | "reels_script";
    sourceCodePrefix: string;
    successMessage: string;
  }) => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const now = Date.now();
    const newDraft: ContentItem = {
      id: `content_local_${now}`,
      title,
      type,
      channel,
      campaign: "Local Studio Drafts",
      cta: "Start Safety Intake",
      complianceStatus: "pending" as const,
      publishStatus: "draft" as const,
      sourceCode: `${sourceCodePrefix}_${now}`,
      performanceNotes: "Local interaction draft for Content Studio usability.",
      createdAt: dateStamp,
      updatedAt: dateStamp,
      body: "",
      topics: [],
      platforms: [channel],
    };
    const payload = await createContentAsset(newDraft).catch(() => ({ asset: newDraft, usingFallback: true }));
    const created = payload.asset ?? newDraft;
    setLocalItems((prev) => [created, ...prev]);
    setSelectedDraftId(created.id);
    setFeedback(payload.usingFallback ? t("Draft saved with fallback data: {title}", { title }) : successMessage);
  };

  const filteredContent =
    activeChannel === "All"
      ? localItems
      : localItems.filter((c) => c.channel === activeChannel);
  const focusDrafts = filteredContent.slice(0, 3);

  const topicBankDrafts = localItems.slice(0, 4);
  const scriptDraftCount = localItems.filter((c) => c.type === "short_video_script" || c.type === "reels_script").length;
  const linkedinDraftCount = localItems.filter((c) => c.type === "linkedin_post").length;
  const focusTopics = topicItems.slice(0, 4);

  const handleCreateDraft = async () => {
    const title = draftTitle.trim();
    if (!title) return;
    const isLinkedIn = draftChannel === "LinkedIn";
    await createLocalDraft({
      title,
      channel: draftChannel,
      type: isLinkedIn ? "linkedin_post" : "short_video_script",
      sourceCodePrefix: isLinkedIn ? "linkedin_local" : "script_local",
      successMessage: t("Draft created: {title}", { title }),
    });
    setShowComposer(false);
    setDraftTitle("");
    setActiveTab(isLinkedIn ? "linkedin-drafts" : "script-drafts");
  };

  const handleAddTopic = () => {
    const next = topicItems.length + 1;
    setTopicItems((prev) => [...prev, { icon: Lightbulb, label: `New Topic ${next}`, count: 1 }]);
    setFeedback(t("Added topic card: {topic}", { topic: `New Topic ${next}` }));
  };

  const handleGenerateTopics = () => {
    setTopicItems((prev) => prev.map((topic, index) => (index < 3 ? { ...topic, count: topic.count + 1 } : topic)));
    setFeedback(t("Generated topic ideas locally and updated topic counts."));
  };

  const handleGenerateReels = async () => {
    const selected = localItems.find((item) => item.id === selectedDraftId) ?? localItems[0];
    if (selected) {
      const payload = await generateContentScript(selected.id, { channel: "Instagram Reels" }).catch(() => null);
      if (payload?.asset) {
        setLocalItems((prev) => prev.map((item) => (item.id === selected.id ? payload.asset! : item)));
        setFeedback(payload.usingFallback ? t("Generated a local Reels script draft.") : t("Generated a script draft from root API."));
        setActiveTab("script-drafts");
        return;
      }
    }

    await createLocalDraft({
      title: "Reels rewrite draft (local)",
      channel: "Instagram Reels",
      type: "reels_script",
      sourceCodePrefix: "reels_local",
      successMessage: t("Generated a local Reels script draft."),
    });
    setActiveTab("script-drafts");
  };

  const handleRiskCheck = () => {
    const selected = localItems.find((item) => item.id === selectedDraftId) ?? localItems[0];
    if (!selected) return;
    runContentComplianceReview(selected.id).then((payload) => {
      if (payload.asset) {
        setLocalItems((prev) => prev.map((item) => (item.id === selected.id ? payload.asset! : item)));
      }
      const riskyCount = localItems.filter((item) => item.complianceStatus === "flagged" || item.complianceStatus === "pending").length;
      setFeedback(t("Risk check complete: {count} draft(s) need compliance review.", { count: riskyCount }));
    });
    setActiveTab("review-queue");
  };

  const handleGenerateLinkedIn = async () => {
    await createLocalDraft({
      title: "LinkedIn version draft (local)",
      channel: "LinkedIn",
      type: "linkedin_post",
      sourceCodePrefix: "linkedin_local",
      successMessage: t("Generated a local LinkedIn draft."),
    });
    setActiveTab("linkedin-drafts");
  };

  const agentActions = [
    { icon: Lightbulb, label: t("Generate 10 topic ideas"), onClick: handleGenerateTopics },
    { icon: RotateCcw, label: t("Rewrite as Reels script"), onClick: handleGenerateReels },
    { icon: AlertTriangle, label: t("Check high-risk terms"), onClick: handleRiskCheck },
    { icon: FileText, label: t("Generate LinkedIn version"), onClick: handleGenerateLinkedIn },
  ];

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Content Studio")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">{t("Keep first screen light. Draft details open on demand.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 border-eastaura-warmgray text-xs" onClick={() => setShowWorkspace((prev) => !prev)}>
            {showWorkspace ? t("Hide full studio") : t("View full studio")}
            <ArrowRight className={cn("h-3.5 w-3.5 transition-transform", showWorkspace ? "rotate-90" : "")} />
          </Button>
          <Button
            className="bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-1.5"
            onClick={() => {
              setShowComposer(true);
              setFeedback(t("Composer opened. Fill title and channel to create a local draft."));
            }}
          >
            <Plus className="w-4 h-4" />
            {t("New Draft")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CompactStat label={t("All drafts")} value={localItems.length} />
        <CompactStat label={t("Needs review")} value={localItems.filter((item) => item.complianceStatus !== "approved").length} />
        <CompactStat label={t("Scheduled")} value={localItems.filter((item) => item.publishStatus === "scheduled").length} />
        <CompactStat label={t("Published")} value={localItems.filter((item) => item.publishStatus === "published").length} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="space-y-6">
          <FocusListPanel
            title={t("Top 3 active drafts")}
            description={t("Keep this list short; open full table only when needed.")}
            items={focusDrafts.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: `${item.channel} · ${item.updatedAt}`,
              badge: item.publishStatus,
            }))}
            selectedId={selectedDraftId}
            onSelect={setSelectedDraftId}
            emptyLabel={t("No drafts found for this filter.")}
            actionLabel={t("View all drafts")}
            onAction={() => setShowWorkspace(true)}
            renderDetail={(summary) => {
              const item = localItems.find((draft) => draft.id === summary.id);
              if (!item) return null;
              return (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.complianceStatus} variant="compliance" />
                    <StatusBadge status={item.publishStatus} variant="publish" />
                  </div>
                  <p className="text-sm text-eastaura-ink-muted">{item.performanceNotes}</p>
                  <div className="rounded-md border border-eastaura-warmgray bg-white p-3">
                    <div className="mb-1 text-xs uppercase text-eastaura-ink-muted">{t("CTA")}</div>
                    <p className="text-sm font-medium text-eastaura-ink">{item.cta}</p>
                  </div>
                  {item.thumbnail && (
                    <div className="overflow-hidden rounded-md border border-eastaura-warmgray">
                      <Image src={item.thumbnail} alt={item.title} width={420} height={180} className="h-28 w-full object-cover" />
                    </div>
                  )}
                </div>
              );
            }}
          />

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-eastaura-ink">{t("This week topic focus")}</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs border-eastaura-warmgray gap-1" onClick={handleAddTopic}>
                  <Plus className="w-3 h-3" /> {t("Add Topic")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {focusTopics.map((topic) => (
                  <div key={topic.label} className="rounded-md border border-eastaura-warmgray bg-white px-3 py-2">
                    <div className="text-sm font-medium text-eastaura-ink">{topic.label}</div>
                    <div className="mt-0.5 text-xs text-eastaura-ink-muted">{t("{count} ideas", { count: topic.count })}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {feedback && (
            <div className="flex items-center justify-between rounded-md border border-eastaura-sage/40 bg-eastaura-sage-muted/40 px-3 py-2">
              <span className="text-xs text-eastaura-ink">{feedback}</span>
              <button className="text-eastaura-ink-muted hover:text-eastaura-ink" onClick={() => setFeedback(null)} aria-label="Dismiss feedback">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {showComposer && (
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-eastaura-ink">{t("Quick Composer")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-eastaura-ink-muted">{t("Title")}</label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="e.g. 30s Sleep Reset POV"
                    className="w-full rounded-md border border-eastaura-warmgray px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-eastaura-ink-muted">{t("Channel")}</label>
                  <select
                    value={draftChannel}
                    onChange={(e) => setDraftChannel(e.target.value)}
                    className="w-full rounded-md border border-eastaura-warmgray px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20"
                  >
                    {channels.filter((ch) => ch !== "All").map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-eastaura-warmgray" onClick={() => setShowComposer(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream"
                    disabled={!draftTitle.trim()}
                    onClick={handleCreateDraft}
                  >
                    {t("Add Content")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4">
              <AgentPanel title={t("Content Agent")} subtitle={t("Your content operations assistant")} actions={agentActions} />
            </CardContent>
          </Card>
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-eastaura-ink">{t("Studio entry")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-eastaura-ink-muted">
              <p>{t("Full drafts table and channel workflow are in the expandable workspace below.")}</p>
              <Button variant="outline" size="sm" className="h-8 text-xs border-eastaura-warmgray gap-1" onClick={() => setShowWorkspace(true)}>
                {t("View full workspace")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showWorkspace && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-eastaura-cream-dark border border-eastaura-warmgray">
              <TabsTrigger value="topic-bank" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
                {t("Topic Bank")}
              </TabsTrigger>
              <TabsTrigger value="script-drafts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
                {t("Script Drafts")}
              </TabsTrigger>
              <TabsTrigger value="linkedin-drafts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
                {t("LinkedIn Drafts")}
              </TabsTrigger>
              <TabsTrigger value="review-queue" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
                {t("Review Queue")}
              </TabsTrigger>
              <TabsTrigger value="published" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
                {t("Published")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 flex-wrap">
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  activeChannel === ch
                    ? "bg-eastaura-forest text-eastaura-cream border-eastaura-forest"
                    : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
                )}
              >
                {t(ch)}
              </button>
            ))}
          </div>

      {activeTab === "topic-bank" && (
        <div className="space-y-6">
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                <CardTitle>{t("This Week's Topics ({count})", { count: topicItems.length })}</CardTitle>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-eastaura-warmgray gap-1" onClick={handleAddTopic}>
                    <Plus className="w-3 h-3" /> {t("Add Topic")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {topicItems.map((topic) => (
                    <div
                      key={topic.label}
                      className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-eastaura-warmgray bg-eastaura-cream-dark p-5 transition-colors hover:border-eastaura-sage/40"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-eastaura-sage-muted">
                        <topic.icon className="h-6 w-6 text-eastaura-forest" />
                      </div>
                      <span className="text-base font-semibold text-eastaura-ink">{topic.label}</span>
                      <span className="mt-1 text-sm text-eastaura-ink-muted">{t("{count} ideas", { count: topic.count })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle>{t("AI-Generated Content Drafts ({count})", { count: topicBankDrafts.length })}</CardTitle>
              </CardHeader>
              <CardContent>
                <DraftsTable items={topicBankDrafts} />
              </CardContent>
            </Card>
        </div>
      )}
        </>
      )}

      {showWorkspace && (activeTab === "script-drafts" || activeTab === "linkedin-drafts" || activeTab === "review-queue" || activeTab === "published") && (
        <div>
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-eastaura-ink">
                    {activeTab === "script-drafts" && t("Short Video Scripts ({count})", { count: scriptDraftCount })}
                    {activeTab === "linkedin-drafts" && t("LinkedIn Post Drafts ({count})", { count: linkedinDraftCount })}
                    {activeTab === "review-queue" && t("Review Queue")}
                    {activeTab === "published" && t("Published Content")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-eastaura-ink-muted" />
                      <input
                        type="text"
                        placeholder={t("Search drafts...")}
                        className="pl-7 pr-2 py-1 text-xs rounded-md border border-eastaura-warmgray bg-white focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20 w-48"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-eastaura-warmgray gap-1">
                      <Filter className="w-3 h-3" /> {t("Filter")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DraftsTable
                  items={
                    activeTab === "script-drafts"
                      ? filteredContent.filter((c) => c.type === "short_video_script" || c.type === "reels_script")
                      : activeTab === "linkedin-drafts"
                      ? filteredContent.filter((c) => c.type === "linkedin_post")
                      : activeTab === "review-queue"
                      ? filteredContent.filter((c) => c.complianceStatus === "flagged" || c.complianceStatus === "pending")
                      : filteredContent.filter((c) => c.publishStatus === "published")
                  }
                />
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-eastaura-warmgray shadow-card" size="sm">
      <CardContent className="py-3">
        <div className="text-xs text-eastaura-ink-muted">{label}</div>
        <div className="mt-1 text-xl font-semibold text-eastaura-ink">{value}</div>
      </CardContent>
    </Card>
  );
}

function DraftsTable({ items }: { items: ContentItem[] }) {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="w-8 h-8 text-eastaura-warmgray mx-auto mb-3" />
        <p className="text-sm text-eastaura-ink-muted">{t("No drafts found for this filter.")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-eastaura-warmgray">
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">{t("Title")}</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">{t("Type")}</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">{t("Channel")}</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">{t("Compliance")}</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">{t("Status")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-eastaura-warmgray/50 last:border-0 hover:bg-eastaura-cream-dark/50">
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md overflow-hidden bg-eastaura-warmgray shrink-0">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.title} width={36} height={36} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-eastaura-sage" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-eastaura-ink font-medium truncate max-w-[260px]">{item.title}</span>
                    <span className="block text-[10px] font-mono text-eastaura-ink-muted truncate max-w-[260px]">
                      {item.sourceCode} - updated {item.updatedAt}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-2.5 pr-4 text-eastaura-ink-muted capitalize">{item.type.replace(/_/g, " ")}</td>
              <td className="py-2.5 pr-4 text-eastaura-ink-muted">{item.channel}</td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={item.complianceStatus} variant="compliance" />
              </td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={item.publishStatus} variant="publish" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

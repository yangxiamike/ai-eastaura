"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  AlertCircle,
  Bell,
  BarChart3,
  ArrowRight,
  RotateCcw,
  FileText,
} from "lucide-react";
import { calendarEvents } from "@/lib/workbench/mock-data";
import { createPublishPost, getContentAssets, getPublishPosts } from "@/lib/workbench/client-api";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import { StatusBadge } from "@/components/workbench/StatusBadge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import { FocusListPanel } from "@/components/workbench/FocusListPanel";

const channels = ["All Channels", "Reels", "TikTok", "Shorts", "LinkedIn", "Newsletter"];

export default function CalendarPage() {
  const { t } = useLanguage();
  const [activeChannel, setActiveChannel] = useState("All Channels");
  const [selectedEventId, setSelectedEventId] = useState(calendarEvents[0]?.id ?? "");
  const [events, setEvents] = useState(calendarEvents);
  const [showWeekBoard, setShowWeekBoard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPublishPosts()
      .then((payload) => {
        if (cancelled || !payload.publishPosts?.length) return;
        setEvents(payload.publishPosts);
        setSelectedEventId(payload.publishPosts[0]?.id ?? "");
        if (payload.usingFallback) {
          setFeedback(t("Using fallback publish posts because root API is unavailable."));
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : t("Failed to load publish posts.")));

    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered =
    activeChannel === "All Channels"
      ? events
      : events.filter((event) => event.channel.toLowerCase().includes(activeChannel.toLowerCase()));

  const topEvents = filtered.slice(0, 3);
  const eventDays = useMemo(() => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], []);

  const stats = {
    planned: filtered.length,
    published: filtered.filter((event) => event.status === "published").length,
    pending: filtered.filter((event) => event.status === "pending" || event.status === "draft" || event.status === "planned").length,
    leads: 8,
  };

  async function handleAddContent() {
    const assets = await getContentAssets().catch(() => ({ assets: [] }));
    const firstAsset = assets.assets?.[0];
    const payload = await createPublishPost({
      assetId: firstAsset?.id,
      campaignId: firstAsset?.campaign,
      title: firstAsset?.title ?? "New scheduled content",
      channel: firstAsset?.channel ?? "Instagram Reels",
      day: 1,
      time: "09:00",
      status: "planned",
      type: firstAsset?.type ?? "short_video_script",
      thumbnail: firstAsset?.thumbnail,
    });
    const created = payload.publishPost;
    if (created) {
      setEvents((prev) => [created, ...prev]);
      setSelectedEventId(created.id);
    }
    setFeedback(payload.usingFallback ? t("New draft slot created for this week.") : t("Publish post created from root API."));
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Publishing Calendar")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">{t("Show only top slots first; open week board when needed.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-eastaura-warmgray text-xs" onClick={() => setShowWeekBoard((prev) => !prev)}>
            {showWeekBoard ? t("Hide week view") : t("View week view")}
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1 bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light"
            onClick={handleAddContent}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("Add Content")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label={t("Planned")} value={stats.planned} />
        <StatCard icon={CheckCircle} label={t("Published")} value={stats.published} />
        <StatCard icon={AlertCircle} label={t("Pending review")} value={stats.pending} />
        <StatCard icon={BarChart3} label={t("Leads")} value={stats.leads} />
      </div>

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

      {feedback && (
        <div className="rounded-md border border-eastaura-sage/35 bg-eastaura-sage-muted/40 px-3 py-2 text-xs text-eastaura-ink">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="space-y-6">
          <FocusListPanel
            title={t("Top 3 scheduled slots")}
            description={t("Select a slot to inspect detail and publish requirements.")}
            items={topEvents.map((event) => ({
              id: event.id,
              title: event.title,
              subtitle: `${event.channel} · ${event.time}`,
              badge: event.status,
            }))}
            selectedId={selectedEventId}
            onSelect={setSelectedEventId}
            emptyLabel={t("No slot found for this filter.")}
            actionLabel={t("View week view")}
            onAction={() => setShowWeekBoard(true)}
            renderDetail={(item) => {
              const event = filtered.find((value) => value.id === item.id);
              if (!event) return null;
              return (
                <div className="space-y-3">
                  <StatusBadge status={event.status} variant="publish" />
                  <div className="overflow-hidden rounded-md border border-eastaura-warmgray bg-white">
                    {event.thumbnail ? (
                      <Image src={event.thumbnail} alt={event.title} width={420} height={160} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 items-center justify-center text-xs text-eastaura-ink-muted">{t("No preview")}</div>
                    )}
                  </div>
                  <div className="rounded-md border border-eastaura-warmgray bg-white p-3 text-sm text-eastaura-ink-muted">
                    <div className="mb-1 text-xs uppercase text-eastaura-ink-muted">{t("Slot detail")}</div>
                    <p className="font-medium text-eastaura-ink">{event.title}</p>
                    <p className="mt-1">{event.channel}</p>
                    <p className="mt-1">{t("Time")}: {event.time}</p>
                  </div>
                </div>
              );
            }}
          />

          {showWeekBoard && (
            <Card className="border-eastaura-warmgray shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("Weekly board")}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-eastaura-ink-muted">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-eastaura-ink-muted">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto pb-1">
                  <div className="grid min-w-[1050px] grid-cols-7 gap-3">
                    {eventDays.map((day, index) => {
                      const dayEvents = filtered.filter((event) => event.day === index).slice(0, 2);
                      return (
                        <div key={day} className="rounded-md border border-eastaura-warmgray bg-eastaura-cream/30 p-2">
                          <div className="mb-2 text-xs font-semibold text-eastaura-ink-muted">{day}</div>
                          <div className="space-y-2">
                            {dayEvents.length === 0 && (
                              <div className="flex h-14 items-center justify-center rounded-md border border-dashed border-eastaura-warmgray text-xs text-eastaura-ink-muted">
                                {t("Empty")}
                              </div>
                            )}
                            {dayEvents.map((event) => (
                              <button
                                key={event.id}
                                className="w-full rounded-md border border-eastaura-warmgray bg-white p-2 text-left"
                                onClick={() => setSelectedEventId(event.id)}
                              >
                                <p className="line-clamp-2 text-xs font-medium text-eastaura-ink">{event.title}</p>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-eastaura-ink-muted">
                                  <span>{event.time}</span>
                                  <span>{event.channel}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-eastaura-warmgray shadow-card">
            <CardContent className="p-4">
              <AgentPanel
                title={t("Schedule Agent")}
                subtitle={t("Quick actions")}
                actions={[
                  { icon: RotateCcw, label: t("Plan trust-first cadence") },
                  { icon: FileText, label: t("Turn script into LinkedIn draft") },
                  { icon: Bell, label: t("Set reminder for today") },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card">
            <CardHeader>
              <CardTitle>{t("Today reminders")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-eastaura-ink-muted">
              <div className="rounded-md border border-eastaura-warmgray bg-white p-3">
                {t("Review medical-boundary script before 10:00 publish slot.")}
              </div>
              <div className="rounded-md border border-eastaura-warmgray bg-white p-3">
                {t("Confirm UTM tags on the Shanghai arrival campaign post.")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-eastaura-warmgray shadow-card" size="sm">
      <CardContent className="py-3">
        <div className="flex items-start gap-2.5">
          <div className="rounded-md bg-eastaura-sage-muted p-1.5 text-eastaura-forest">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-eastaura-ink-muted">{label}</div>
            <div className="mt-1 text-xl font-semibold text-eastaura-ink">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

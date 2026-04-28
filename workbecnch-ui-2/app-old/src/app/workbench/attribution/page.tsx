"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MousePointerClick,
  FormInput,
  Star,
  Video,
  Lightbulb,
  AlertTriangle,
  FileText,
  BarChart3,
} from "lucide-react";
import { attributionFunnel, attributionKPIs, channelPerformance } from "@/lib/workbench/mock-data";
import { getContentAttribution } from "@/lib/workbench/client-api";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import { FocusListPanel } from "@/components/workbench/FocusListPanel";
import type { AttributionSummary } from "@/lib/workbench/types";

const dateRanges = ["Last 7 days", "Last 30 days", "This quarter"];

export default function AttributionPage() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [selectedChannel, setSelectedChannel] = useState(channelPerformance[0]?.channel ?? "");
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [channels, setChannels] = useState(channelPerformance);
  const [summary, setSummary] = useState<AttributionSummary | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getContentAttribution()
      .then((payload) => {
        if (cancelled) return;
        if (payload.summary) {
          setSummary(payload.summary);
        }
        if (payload.channels?.length) {
          setChannels(payload.channels);
          setSelectedChannel(payload.channels[0]?.channel ?? "");
        }
        if (payload.usingFallback) {
          setFeedback(t("Using fallback attribution summary because root API is unavailable."));
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : t("Failed to load attribution summary.")));

    return () => {
      cancelled = true;
    };
  }, [dateRange, t]);

  const topChannels = channels.slice(0, 3);
  const kpis = {
    totalImpressions: (summary?.byMetricType.impressions ?? attributionKPIs.totalImpressions).toLocaleString(),
    siteClicks: (summary?.byMetricType.clicks ?? summary?.byMetricType.click ?? attributionKPIs.siteClicks).toLocaleString(),
    formSubmissions: summary?.leadsAttributed ?? attributionKPIs.formSubmissions,
    highIntentLeads: attributionKPIs.highIntentLeads,
    videoConsultations: summary?.byMetricType.consultation ?? attributionKPIs.videoConsultations,
  };
  const funnel = summary
    ? [
        { stage: "Total metrics", count: summary.totalMetrics, percentage: 100 },
        { stage: "Metric value", count: summary.totalMetricValue, percentage: Math.round((summary.totalMetricValue / Math.max(summary.totalMetrics, 1)) * 100) },
        { stage: "Leads attributed", count: summary.leadsAttributed, percentage: Math.round((summary.leadsAttributed / Math.max(summary.totalMetrics, 1)) * 100) },
        { stage: "Campaigns", count: Object.keys(summary.byCampaign).length, percentage: 100 },
      ]
    : attributionFunnel;

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Lead Attribution")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">{t("First screen shows only top channels and the main funnel pulse.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dateRanges.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                dateRange === range
                  ? "border-eastaura-forest bg-eastaura-forest text-eastaura-cream"
                  : "border-eastaura-warmgray bg-white text-eastaura-ink-muted hover:border-eastaura-sage/50"
              )}
            >
              {t(range)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard icon={Eye} label={t("Impressions")} value={kpis.totalImpressions} />
        <KpiCard icon={MousePointerClick} label={t("Site clicks")} value={kpis.siteClicks} />
        <KpiCard icon={FormInput} label={t("Form submit")} value={`${kpis.formSubmissions}`} />
        <KpiCard icon={Star} label={t("High intent")} value={`${kpis.highIntentLeads}`} />
        <KpiCard icon={Video} label={t("Consultations")} value={`${kpis.videoConsultations}`} />
      </div>

      {feedback && (
        <div className="rounded-md border border-eastaura-sage/35 bg-eastaura-sage-muted/40 px-3 py-2 text-xs text-eastaura-ink">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="space-y-6">
          <FocusListPanel
            title={t("Top 3 channels")}
            description={t("Detail opens in-place. Expand full table only when needed.")}
            items={topChannels.map((channel) => ({
              id: channel.channel,
              title: channel.channel,
              subtitle: `${channel.leads} leads · ${channel.leadRate}`,
              badge: channel.clickRate,
            }))}
            selectedId={selectedChannel}
            onSelect={setSelectedChannel}
            emptyLabel={t("No channel data available.")}
            actionLabel={t("View all channels")}
            onAction={() => setShowAllChannels(true)}
            renderDetail={(item) => {
              const channel = channels.find((value) => value.channel === item.id);
              if (!channel) return null;
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      {t("Content")}: <span className="font-medium text-eastaura-ink">{channel.contentCount}</span>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      {t("Clicks")}: <span className="font-medium text-eastaura-ink">{channel.clicks}</span>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      {t("Lead rate")}: <span className="font-medium text-eastaura-ink">{channel.leadRate}</span>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      {t("High intent")}: <span className="font-medium text-eastaura-ink">{channel.highIntent}</span>
                    </div>
                  </div>
                  <div className="rounded-md border border-eastaura-warmgray bg-white p-3">
                    <div className="mb-1 text-xs uppercase text-eastaura-ink-muted">{t("AI suggestion")}</div>
                    <p className="text-sm text-eastaura-ink">{channel.suggestion}</p>
                  </div>
                </div>
              );
            }}
          />

          <Card className="border-eastaura-warmgray shadow-card">
            <CardHeader>
              <CardTitle>{t("Main work panel: funnel pulse")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {funnel.slice(0, 4).map((stage, index) => (
                <div key={stage.stage} className="grid grid-cols-[130px_minmax(0,1fr)_48px] items-center gap-3">
                  <div className="text-xs text-eastaura-ink-muted">{stage.stage}</div>
                  <div className="h-7 overflow-hidden rounded-md bg-eastaura-warmgray-light">
                    <div
                      className="flex h-full items-center px-2 text-xs font-medium text-white"
                      style={{
                        width: `${Math.max(10, (stage.count / Math.max(funnel[0].count, 1)) * 100)}%`,
                        backgroundColor: index === 0 ? "#1a3a2f" : index === 1 ? "#3d6654" : index === 2 ? "#6b8f71" : "#b8956a",
                      }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-eastaura-ink-muted">{stage.percentage}%</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {showAllChannels && (
            <Card className="border-eastaura-warmgray shadow-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("All channel performance")}</CardTitle>
                <Button variant="outline" size="sm" className="h-8 border-eastaura-warmgray text-xs" onClick={() => setShowAllChannels(false)}>
                  {t("Collapse")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-eastaura-warmgray">
                        <th className="py-2 pr-3 text-left text-xs text-eastaura-ink-muted">{t("Channel")}</th>
                        <th className="py-2 pr-3 text-right text-xs text-eastaura-ink-muted">{t("Content")}</th>
                        <th className="py-2 pr-3 text-right text-xs text-eastaura-ink-muted">{t("Clicks")}</th>
                        <th className="py-2 pr-3 text-right text-xs text-eastaura-ink-muted">{t("Lead rate")}</th>
                        <th className="py-2 text-left text-xs text-eastaura-ink-muted">{t("Suggestion")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((channel) => (
                        <tr key={channel.channel} className="border-b border-eastaura-warmgray/50 last:border-0">
                          <td className="py-2.5 pr-3 font-medium text-eastaura-ink">{channel.channel}</td>
                          <td className="py-2.5 pr-3 text-right text-eastaura-ink-muted">{channel.contentCount}</td>
                          <td className="py-2.5 pr-3 text-right text-eastaura-ink">{channel.clicks}</td>
                          <td className="py-2.5 pr-3 text-right text-eastaura-ink">{channel.leadRate}</td>
                          <td className="py-2.5 text-xs text-eastaura-ink-muted">{channel.suggestion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-eastaura-warmgray shadow-card">
            <CardContent className="p-4">
              <AgentPanel
                title={t("Insight Agent")}
                subtitle={t("Decision support")}
                actions={[
                  { icon: FileText, label: t("Summarize pilot-ready channels") },
                  { icon: AlertTriangle, label: t("Find unqualified traffic") },
                  { icon: Lightbulb, label: t("Recommend next topics") },
                  { icon: BarChart3, label: t("Generate founder report") },
                ]}
                noteTitle={t("Current signal")}
                note={t("Reels keeps volume high. LinkedIn keeps intent high. Keep both but separate CTA goals.")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
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
            <div className="mt-1 text-lg font-semibold text-eastaura-ink">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserRoundCheck,
  AlertTriangle,
  ListTodo,
  Lightbulb,
  Mail,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import type { Lead } from "@/lib/workbench/types";
import { getDashboard, type ApiMeta, type WorkbenchStats } from "@/lib/workbench/client-api";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import { FocusListPanel } from "@/components/workbench/FocusListPanel";
import { useLanguage } from "@/components/workbench/LanguageProvider";

export default function Dashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedPriorityId, setSelectedPriorityId] = useState("priority-0");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [stats, setStats] = useState<WorkbenchStats>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    getDashboard()
      .then((data) => {
        if (!alive) return;
        const nextLeads = data.leads ?? [];
        setStats(data.stats ?? {});
        setLeads(nextLeads);
        setSelectedLeadId((current) => current || nextLeads[0]?.id || "");
        setMeta({ usingFallback: data.usingFallback, error: data.error });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setMeta({ error: error instanceof Error ? error.message : t("Failed to load dashboard.") });
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [t]);

  const priorityTitles = [
    "Review medical-risk leads before any sales contact",
    "Approve content with safety wording before publishing",
    "Prepare consultation notes for qualified leads",
  ];

  const priorityItems = priorityTitles.slice(0, 3).map((title, index) => ({
    id: `priority-${index}`,
    title,
    subtitle:
      index === 0
        ? t("Risk and compliance first")
        : index === 1
        ? t("Publishing quality gate")
        : t("Sales readiness"),
    badge: index === 0 ? t("High") : t("Today"),
  }));

  const focusLeads = useMemo(() => {
    return [...leads].sort((a, b) => (b.intentScore ?? 0) - (a.intentScore ?? 0)).slice(0, 3);
  }, [leads]);

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Workbench")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">{t("Today only: KPI, top 3 tasks, and focus leads.")}</p>
        </div>
        <Link
          href="/workbench/review-tasks"
          className="inline-flex h-9 w-fit items-center gap-1 rounded-md border border-eastaura-warmgray bg-white px-3 text-xs font-medium text-eastaura-ink transition-colors hover:bg-eastaura-cream-dark"
        >
          {t("Open review queue")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {(isLoading || meta.error || meta.usingFallback) && (
        <Card className="border-eastaura-warmgray shadow-card">
          <CardContent className="py-3 text-sm text-eastaura-ink-muted">
            {isLoading && t("Loading dashboard data...")}
            {!isLoading && meta.usingFallback && !meta.error && t("Showing fallback workbench data.")}
            {!isLoading && meta.error && (
              <span className="text-red-600">{t("Dashboard data is unavailable.")} {meta.error}</span>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label={t("New leads")} value={stats.newLeadsToday ?? 0} />
        <StatCard icon={UserRoundCheck} label={t("High intent")} value={stats.highIntentLeads ?? 0} />
        <StatCard icon={AlertTriangle} label={t("High risk")} value={stats.highRiskLeads ?? 0} alert />
        <StatCard icon={ListTodo} label={t("Pending review")} value={stats.pendingReviewTasks ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="space-y-6">
          <FocusListPanel
            title={t("Today's top 3 priorities")}
            description={t("Handle these first, then expand to full queue.")}
            items={priorityItems}
            selectedId={selectedPriorityId}
            onSelect={setSelectedPriorityId}
            emptyLabel={t("No priority for now.")}
            actionLabel={t("View all tasks")}
            onAction={() => router.push("/workbench/review-tasks")}
            maxVisible={3}
            renderDetail={(item) => (
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-eastaura-ink-muted">{t("Priority detail")}</div>
                <h3 className="text-lg font-semibold text-eastaura-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-eastaura-ink-muted">
                  {item.id === "priority-0" &&
                    t("Review risk note and approved language before any outreach or offer edits.")}
                  {item.id === "priority-1" &&
                    t("Only release content with safety phrasing and clear intake CTA.")}
                  {item.id === "priority-2" &&
                    t("Prepare concise call agenda and objection handling for the next consultation.")}
                </p>
              </div>
            )}
          />

          <FocusListPanel
            title={t("Main work panel: lead focus")}
            description={t("Only 3 leads shown here. Open lead center for full pipeline.")}
            items={focusLeads.map((lead) => ({
              id: lead.id,
              title: lead.name,
              subtitle: `${lead.country} · ${lead.source}`,
              badge: `${lead.intentScore}`,
            }))}
            selectedId={selectedLeadId}
            onSelect={setSelectedLeadId}
            emptyLabel={t("No lead available.")}
            actionLabel={t("Open lead center")}
            onAction={() => router.push("/workbench/leads")}
            maxVisible={3}
            renderDetail={(item) => {
              const lead = focusLeads.find((value) => value.id === item.id);
              if (!lead) return null;
              return (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-eastaura-ink-muted">{t("Lead snapshot")}</div>
                    <h3 className="text-lg font-semibold text-eastaura-ink">{lead.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-white p-2 text-eastaura-ink-muted">
                    {t("Risk")}: <span className="font-medium text-eastaura-ink">{lead.riskLevel ?? "-"}</span>
                    </div>
                    <div className="rounded-md bg-white p-2 text-eastaura-ink-muted">
                    {t("Status")}: <span className="font-medium text-eastaura-ink">{lead.status ?? "-"}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-eastaura-ink-muted">
                    {lead.aiSummary
                      ? lead.aiSummary.length > 180
                        ? `${lead.aiSummary.slice(0, 180)}...`
                        : lead.aiSummary
                      : t("Open the lead detail to review the latest intake summary.")}
                  </p>
                  <div className="rounded-md border border-eastaura-warmgray bg-white p-3 text-sm">
                    <div className="mb-1 text-xs uppercase text-eastaura-ink-muted">{t("Next action")}</div>
                    <div className="font-medium text-eastaura-ink">{lead.nextAction || t("Open the lead detail.")}</div>
                  </div>
                  <Link
                    href={`/workbench/leads/${lead.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-md bg-eastaura-forest px-3 text-xs font-medium text-eastaura-cream transition-colors hover:bg-eastaura-forest-light"
                  >
                    {t("Open lead detail")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-eastaura-warmgray shadow-card">
            <CardContent className="p-4">
              <AgentPanel
                title={t("Agent lane")}
                subtitle={t("Quick actions")}
                actions={[
                  { icon: Lightbulb, label: t("Generate today's content suggestions") },
                  { icon: ShieldAlert, label: t("Check medical-risk wording") },
                  { icon: Mail, label: t("Draft follow-up email") },
                ]}
                noteTitle={t("Quick pulse")}
                note={t("AI saved {value} today. Keep founder attention on risk review and qualified lead calls.", {
                  value: stats.aiTimeSaved ?? "0h",
                })}
              />
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card">
            <CardHeader className="pb-2">
              <CardTitle>{t("Go deeper")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link
                href="/workbench/review-tasks"
                className="flex items-center justify-between rounded-md border border-eastaura-warmgray bg-white px-3 py-2 text-sm text-eastaura-ink transition-colors hover:bg-eastaura-cream-dark"
              >
                <span>{t("View all review tasks")}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-eastaura-ink-muted" />
              </Link>
              <Link
                href="/workbench/leads"
                className="flex items-center justify-between rounded-md border border-eastaura-warmgray bg-white px-3 py-2 text-sm text-eastaura-ink transition-colors hover:bg-eastaura-cream-dark"
              >
                <span>{t("Open leads pipeline")}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-eastaura-ink-muted" />
              </Link>
              <Link
                href="/workbench/content"
                className="flex items-center justify-between rounded-md border border-eastaura-warmgray bg-white px-3 py-2 text-sm text-eastaura-ink transition-colors hover:bg-eastaura-cream-dark"
              >
                <span>{t("Go to content studio")}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-eastaura-ink-muted" />
              </Link>
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
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <Card className="border-eastaura-warmgray shadow-card" size="sm">
      <CardContent className="py-3">
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 rounded-md p-2.5 ${
              alert ? "bg-red-50 text-red-600" : "bg-eastaura-sage-muted text-eastaura-forest"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm leading-tight text-eastaura-ink-muted">{label}</div>
            <div className={`mt-1 text-xl font-semibold ${alert ? "text-red-600" : "text-eastaura-ink"}`}>
              {value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

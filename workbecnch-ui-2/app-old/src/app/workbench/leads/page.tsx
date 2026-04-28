"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronRight,
  Download,
  ArrowRight,
  FileText,
  Sparkles,
  MessageSquareMore,
} from "lucide-react";
import type { Lead } from "@/lib/workbench/types";
import { getLeadAvatar, getLeadGoals, getLeads, type ApiMeta } from "@/lib/workbench/client-api";
import { StatusBadge } from "@/components/workbench/StatusBadge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import { FocusListPanel } from "@/components/workbench/FocusListPanel";
import { AgentPanel } from "@/components/workbench/AgentPanel";

const primaryStatusFilters = ["All", "New", "Qualified", "Consultation Booked"];

export default function LeadsCRM() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [showLeadTable, setShowLeadTable] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<ApiMeta>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    getLeads()
      .then((data) => {
        if (!alive) return;
        const nextLeads = data.leads ?? [];
        setLeads(nextLeads);
        setTotal(data.total ?? nextLeads.length);
        setSelectedLeadId((current) => current || nextLeads[0]?.id || "");
        setMeta({ usingFallback: data.usingFallback, error: data.error });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setMeta({ error: error instanceof Error ? error.message : "Failed to load leads." });
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesSearch =
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          lead.country.toLowerCase().includes(search.toLowerCase()) ||
          lead.email.toLowerCase().includes(search.toLowerCase()) ||
          getLeadGoals(lead).join(" ").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || lead.status === statusFilter.toLowerCase().replace(/ /g, "_");
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (b.intentScore ?? 0) - (a.intentScore ?? 0));
  }, [leads, search, statusFilter]);

  const focusLeads = filtered.slice(0, 4);
  const selectedLead = filtered.find((lead) => lead.id === selectedLeadId) ?? focusLeads[0] ?? null;

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Leads")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">
            {t("{total} total leads · {newCount} new this week", {
              total,
              newCount: leads.filter((lead) => lead.status === "new").length,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-eastaura-warmgray text-xs" onClick={() => setShowLeadTable((prev) => !prev)}>
            {showLeadTable ? t("Hide full table") : t("Open full table")}
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-eastaura-warmgray text-xs">
            <Download className="h-3.5 w-3.5" />
            {t("Export")}
          </Button>
        </div>
      </div>

      {(isLoading || meta.error || meta.usingFallback) && (
        <Card className="border-eastaura-warmgray shadow-card">
          <CardContent className="py-3 text-sm text-eastaura-ink-muted">
            {isLoading && t("Loading leads...")}
            {!isLoading && meta.usingFallback && !meta.error && t("Showing fallback workbench data.")}
            {!isLoading && meta.error && <span className="text-red-600">{t("Lead data is unavailable.")} {meta.error}</span>}
          </CardContent>
        </Card>
      )}

      <Card className="border-eastaura-warmgray shadow-card">
        <CardContent className="space-y-3 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-eastaura-ink-muted" />
            <Input
              placeholder={t("Search by name, country, goal...")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 border-eastaura-warmgray bg-white pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-eastaura-ink-muted">
              <Filter className="h-3.5 w-3.5" />
              {t("Status")}
            </div>
            {primaryStatusFilters.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  statusFilter === status
                    ? "border-eastaura-forest bg-eastaura-forest text-eastaura-cream"
                    : "border-eastaura-warmgray bg-white text-eastaura-ink-muted hover:border-eastaura-sage/50"
                )}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="space-y-6">
          <FocusListPanel
            title={t("Top leads in current filter")}
            description={t("Main screen keeps only decision fields. Expand full list for bulk view.")}
            items={focusLeads.map((lead) => ({
              id: lead.id,
              title: lead.name,
              subtitle: `${lead.country} · ${getLeadGoals(lead).join(" / ") || t("No goals yet")}`,
              badge: `${t("Intent")} ${lead.intentScore ?? 0}`,
            }))}
            selectedId={selectedLead?.id ?? ""}
            onSelect={setSelectedLeadId}
            emptyLabel={t("No leads match your filters.")}
            actionLabel={t("View full list")}
            onAction={() => setShowLeadTable(true)}
            renderDetail={(item) => {
              const lead = filtered.find((value) => value.id === item.id);
              if (!lead) return null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-eastaura-warmgray">
                      <Image src={getLeadAvatar(lead)} alt={lead.name} width={40} height={40} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-eastaura-ink">{lead.name}</div>
                      <div className="text-xs text-eastaura-ink-muted">{lead.country}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      <div className="text-eastaura-ink-muted">{t("Target")}</div>
                      <div className="mt-1 font-semibold text-eastaura-ink">{getLeadGoals(lead).join(" / ") || t("No goals yet")}</div>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      <div className="text-eastaura-ink-muted">{t("Intent")}</div>
                      <div className="mt-1 font-semibold text-eastaura-ink">{lead.intentScore ?? 0}</div>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      <div className="text-eastaura-ink-muted">{t("Risk")}</div>
                      <div className="mt-1">
                        <StatusBadge status={lead.riskLevel ?? "low"} variant="risk" />
                      </div>
                    </div>
                    <div className="rounded-md border border-eastaura-warmgray bg-white p-2">
                      <div className="text-eastaura-ink-muted">{t("Next step")}</div>
                      <div className="mt-1 font-semibold text-eastaura-ink">{lead.nextAction || t("Open the lead detail.")}</div>
                    </div>
                  </div>
                  <Link href={`/workbench/leads/${lead.id}`} className="inline-flex">
                    <Button size="sm" className="h-8 gap-1 bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light">
                      {t("Open lead detail")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            }}
          />

          {!showLeadTable && (
            <Card className="border-eastaura-warmgray shadow-card">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="text-sm text-eastaura-ink-muted">
                  {t("{count} leads in current filter. Open full list only when batch handling is needed.", {
                    count: filtered.length,
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 border-eastaura-warmgray text-xs"
                  onClick={() => setShowLeadTable(true)}
                >
                  {t("View full list")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="border-eastaura-warmgray shadow-card">
            <CardHeader>
              <CardTitle>{t("Selected lead")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedLead ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-eastaura-warmgray">
                      <Image src={getLeadAvatar(selectedLead)} alt={selectedLead.name} width={36} height={36} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-eastaura-ink">{selectedLead.name}</div>
                      <div className="text-xs text-eastaura-ink-muted">{selectedLead.email}</div>
                    </div>
                  </div>
                  <div className="rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark p-3 text-xs text-eastaura-ink-muted">
                    {selectedLead.sourceAttribution
                      ? `${selectedLead.sourceAttribution.channel} · ${selectedLead.sourceAttribution.contentItem}`
                      : selectedLead.source}
                  </div>
                  <Link href={`/workbench/leads/${selectedLead.id}`} className="inline-flex">
                    <Button size="sm" className="h-8 gap-1 bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light">
                      {t("Open lead detail")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="rounded-md border border-dashed border-eastaura-warmgray p-4 text-sm text-eastaura-ink-muted">
                  {t("No lead selected.")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card">
            <CardContent className="p-4">
              <AgentPanel
                title={t("Lead Agent")}
                subtitle={t("Quick action queue")}
                actions={[
                  { icon: MessageSquareMore, label: t("Draft follow-up message") },
                  { icon: FileText, label: t("Summarize intake risks") },
                  { icon: Sparkles, label: t("Generate call prep notes") },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {showLeadTable && (
        <Card className="overflow-hidden border-eastaura-warmgray shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("Full lead table")}</CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-eastaura-warmgray text-xs" onClick={() => setShowLeadTable(false)}>
              {t("Collapse")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-eastaura-warmgray bg-eastaura-cream-dark/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Name")}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Country")}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Status")}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Risk")}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Intent")}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-eastaura-ink-muted">{t("Last activity")}</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b border-eastaura-warmgray/40 last:border-0 hover:bg-eastaura-cream-dark/40">
                      <td className="px-3 py-2.5">
                        <Link href={`/workbench/leads/${lead.id}`} className="flex items-center gap-2">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-eastaura-warmgray">
                            <Image src={getLeadAvatar(lead)} alt={lead.name} width={32} height={32} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-eastaura-ink">{lead.name}</div>
                            <div className="text-[10px] text-eastaura-ink-muted">{lead.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-eastaura-ink-muted">
                          <MapPin className="h-3 w-3" />
                          {lead.country}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={lead.status} variant="status" />
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={lead.riskLevel ?? "low"} variant="risk" />
                      </td>
                      <td className="px-3 py-2.5 text-eastaura-ink">{lead.intentScore ?? 0}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-eastaura-ink-muted">
                          <Clock className="h-3 w-3" />
                          {lead.lastActivity}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link href={`/workbench/leads/${lead.id}`}>
                          <ChevronRight className="h-4 w-4 text-eastaura-ink-muted hover:text-eastaura-forest" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-eastaura-ink-muted">{t("No leads match your filters.")}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

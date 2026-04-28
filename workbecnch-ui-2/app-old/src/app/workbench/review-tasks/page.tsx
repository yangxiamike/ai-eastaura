"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  ShieldAlert,
  Mail,
  FileCheck,
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Edit3,
  Clock,
  Filter,
} from "lucide-react";
import { reviewTasks } from "@/lib/workbench/mock-data";
import { getReviewTasks, updateReviewTask } from "@/lib/workbench/client-api";
import { StatusBadge } from "@/components/workbench/StatusBadge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import type { ReviewTask } from "@/lib/workbench/types";

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  lead_risk_review: { icon: ShieldAlert, label: "Lead Risk Review", color: "text-red-500" },
  followup_email_approval: { icon: Mail, label: "Follow-up Email", color: "text-blue-500" },
  content_compliance: { icon: FileCheck, label: "Content Compliance", color: "text-amber-500" },
  script_approval: { icon: ClipboardCheck, label: "Script Approval", color: "text-purple-500" },
  notification_priority: { icon: Bell, label: "Notification Priority", color: "text-eastaura-forest" },
};

const filters = ["All", "Open", "Approved", "Needs revision", "Rejected"];

export default function ReviewTasks() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("All");
  const [tasks, setTasks] = useState(reviewTasks);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getReviewTasks()
      .then((payload) => {
        if (cancelled || !payload.reviewTasks?.length) return;
        setTasks(payload.reviewTasks);
        if (payload.usingFallback) {
          setFeedback(t("Using fallback review tasks because root API is unavailable."));
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : t("Failed to load review tasks.")));

    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = tasks.filter((t) => {
    if (activeFilter === "All") return true;
    const status = activeFilter.toLowerCase().replace(/\s+/g, "_");
    if (status === "open") return t.status === "open" || t.status === "pending";
    if (status === "needs_revision") return t.status === "needs_revision" || t.status === "edited";
    return t.status === status;
  });

  const handleAction = async (id: string, action: ReviewTask["status"]) => {
    const payload = await updateReviewTask(id, action).catch(() => null);
    setTasks((prev) => prev.map((task) => (task.id === id ? payload?.reviewTask ?? { ...task, status: action } : task)));
    if (payload?.usingFallback) {
      setFeedback(t("Review task updated with fallback data."));
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Review Tasks")}</h1>
          <p className="mt-1 text-base text-eastaura-ink-muted">
            {t("AI-generated items requiring human approval before execution")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TaskStat label={t("Open")} value={tasks.filter((t) => t.status === "open" || t.status === "pending").length} color="bg-eastaura-gold-muted text-eastaura-warning" />
        <TaskStat label={t("Approved")} value={tasks.filter((t) => t.status === "approved").length} color="bg-eastaura-sage-muted text-eastaura-success" />
        <TaskStat label={t("Rejected")} value={tasks.filter((t) => t.status === "rejected").length} color="bg-red-50 text-red-600" />
        <TaskStat label={t("Needs revision")} value={tasks.filter((t) => t.status === "needs_revision" || t.status === "edited").length} color="bg-blue-50 text-blue-600" />
      </div>

      {feedback && (
        <div className="rounded-md border border-eastaura-sage/35 bg-eastaura-sage-muted/40 px-3 py-2 text-xs text-eastaura-ink">
          {feedback}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-eastaura-ink-muted" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeFilter === f
                ? "bg-eastaura-forest text-eastaura-cream border-eastaura-forest"
                : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
            )}
          >
            {t(f)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task) => {
          const config = typeConfig[task.type];
          const Icon = config?.icon || ClipboardCheck;
          return (
            <Card
              key={task.id}
              className={cn(
                "border shadow-card rounded-lg",
                task.status === "pending" ? "border-eastaura-warmgray" : "border-eastaura-warmgray/50 bg-eastaura-cream-dark/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-start gap-3 md:w-48 shrink-0">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", task.status === "pending" ? "bg-eastaura-sage-muted" : "bg-eastaura-warmgray-light")}>
                      <Icon className={cn("w-4 h-4", config?.color || "text-eastaura-forest")} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-eastaura-ink">{t(config?.label || task.type)}</div>
                      <StatusBadge status={task.priority} variant="priority" className="mt-1" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-eastaura-ink">{task.relatedObject}</div>
                    <div className="text-xs text-eastaura-ink-muted mt-1">
                      <span className="font-medium">{t("AI Recommendation:")}</span> {task.aiRecommendation}
                    </div>
                    {task.details && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-eastaura-ink-muted">
                        <AlertTriangle className="w-3 h-3 text-eastaura-warning" />
                        {task.details}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-eastaura-ink-muted">
                      <Clock className="w-3 h-3" />
                      {t("Created {value}", { value: new Date(task.createdAt).toLocaleString() })}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                    <StatusBadge status={task.status} variant="status" />
                    {(task.status === "open" || task.status === "pending") && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 text-[11px] bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-1 px-2.5"
                          onClick={() => handleAction(task.id, "approved")}
                        >
                          <CheckCircle className="w-3 h-3" /> {t("Approve")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] border-eastaura-warmgray gap-1 px-2.5"
                          onClick={() => handleAction(task.id, "needs_revision")}
                        >
                          <Edit3 className="w-3 h-3" /> {t("Needs revision")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50 gap-1 px-2.5"
                          onClick={() => handleAction(task.id, "rejected")}
                        >
                          <XCircle className="w-3 h-3" /> {t("Reject")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <ClipboardCheck className="w-8 h-8 text-eastaura-warmgray mx-auto mb-3" />
          <p className="text-sm text-eastaura-ink-muted">{t("No review tasks match this filter.")}</p>
        </div>
      )}
    </div>
  );
}

function TaskStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="border-eastaura-warmgray shadow-card rounded-lg">
      <CardContent className="p-3">
        <div className={cn("text-lg font-semibold", color.split(" ")[1])}>{value}</div>
        <div className="text-xs text-eastaura-ink-muted">{label}</div>
      </CardContent>
    </Card>
  );
}

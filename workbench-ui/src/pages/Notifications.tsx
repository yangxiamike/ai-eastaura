import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  Calendar,
  MailWarning,
  Bot,
  Check,
  Clock,
  Filter,
} from "lucide-react";
import { notifications } from "@/data/mock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  new_lead: { icon: UserPlus, label: "New Lead", color: "text-eastaura-forest", bg: "bg-eastaura-sage-muted" },
  high_risk_alert: { icon: AlertTriangle, label: "High Risk", color: "text-red-600", bg: "bg-red-50" },
  followup_reminder: { icon: MessageSquare, label: "Follow-up", color: "text-eastaura-warning", bg: "bg-eastaura-gold-muted" },
  daily_brief: { icon: Calendar, label: "Daily Brief", color: "text-blue-600", bg: "bg-blue-50" },
  failed_email: { icon: MailWarning, label: "Failed Email", color: "text-red-600", bg: "bg-red-50" },
  failed_ai_task: { icon: Bot, label: "AI Task Failed", color: "text-purple-600", bg: "bg-purple-50" },
};

const statusFilters = ["All", "Pending", "Sent", "Failed", "Skipped"];
const typeFilters = ["All Types", "New Lead", "High Risk", "Follow-up", "Daily Brief", "Failed Email", "AI Task Failed"];

export default function Notifications() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [notifs, setNotifs] = useState(notifications);

  const filtered = notifs.filter((n) => {
    const matchesStatus = statusFilter === "All" || n.status === statusFilter.toLowerCase();
    const matchesType = typeFilter === "All Types" || typeConfig[n.type]?.label === typeFilter;
    return matchesStatus && matchesType;
  });

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-eastaura-ink">Notifications</h1>
          <p className="text-sm text-eastaura-ink-muted mt-0.5">
            {notifs.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-eastaura-ink-muted" />
              {statusFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                    statusFilter === s
                      ? "bg-eastaura-forest text-eastaura-cream border-eastaura-forest"
                      : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {typeFilters.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                    typeFilter === t
                      ? "bg-eastaura-gold text-eastaura-forest border-eastaura-gold"
                      : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-eastaura-warmgray/50">
            {filtered.map((notif) => {
              const config = typeConfig[notif.type];
              const Icon = config?.icon || Bell;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-eastaura-cream-dark/30 transition-colors",
                    !notif.read && "bg-eastaura-cream-dark/50"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config?.bg || "bg-eastaura-warmgray-light")}>
                    <Icon className={cn("w-4.5 h-4.5", config?.color || "text-eastaura-forest")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-eastaura-ink">{notif.title}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-eastaura-gold shrink-0" />}
                    </div>
                    <p className="text-xs text-eastaura-ink-muted mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={notif.status} variant="notification" />
                      <span className="text-[10px] text-eastaura-ink-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.createdAt}
                      </span>
                    </div>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="shrink-0 p-1.5 rounded-md hover:bg-eastaura-warmgray-light text-eastaura-ink-muted hover:text-eastaura-forest transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="w-8 h-8 text-eastaura-warmgray mx-auto mb-3" />
              <p className="text-sm text-eastaura-ink-muted">No notifications match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

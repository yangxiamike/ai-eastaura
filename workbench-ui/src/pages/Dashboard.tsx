import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Star,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Target,
  Funnel,
} from "lucide-react";
import {
  dashboardStats,
  funnelData,
  dailyBrief,
  recentAiSummaries,
  topContent,
} from "@/data/mock";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-eastaura-ink">Dashboard</h1>
        <p className="text-sm text-eastaura-ink-muted mt-0.5">
          Content, leads, and decisions that need your attention today
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={Users} label="New Leads" value={dashboardStats.newLeadsToday} />
        <StatCard icon={Star} label="High Intent" value={dashboardStats.highIntentLeads} />
        <StatCard icon={AlertTriangle} label="High Risk" value={dashboardStats.highRiskLeads} alert />
        <StatCard icon={ClipboardCheck} label="Review Tasks" value={dashboardStats.pendingReviewTasks} />
        <StatCard icon={FileText} label="Drafts" value={dashboardStats.contentDraftsWaiting} />
        <StatCard icon={MessageSquare} label="Follow-ups" value={dashboardStats.followUpsDueToday} />
        <StatCard icon={Clock} label="AI Saved" value={dashboardStats.aiTimeSaved} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Funnel Snapshot */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                  <Funnel className="w-4 h-4 text-eastaura-sage" />
                  Funnel Snapshot
                </CardTitle>
                <span className="text-xs text-eastaura-ink-muted">Last 7 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {funnelData.map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-eastaura-ink-muted shrink-0">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="h-7 rounded-sm bg-eastaura-warmgray-light overflow-hidden flex items-center">
                        <div
                          className="h-full flex items-center px-2 transition-all"
                          style={{
                            width: `${Math.max(8, (stage.count / funnelData[0].count) * 100)}%`,
                            backgroundColor:
                              i === 0
                                ? "#1a3a2f"
                                : i === 1
                                ? "#3d6654"
                                : i === 2
                                ? "#6b8f71"
                                : i === 3
                                ? "#b8956a"
                                : "#d4b88a",
                          }}
                        >
                          <span className="text-xs font-medium text-white whitespace-nowrap">
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-12 text-xs text-eastaura-ink-muted text-right">
                      {stage.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Content */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-eastaura-sage" />
                  Top Performing Content
                </CardTitle>
                <Link
                  to="/workbench/content"
                  className="text-xs text-eastaura-forest hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-eastaura-warmgray">
                      <th className="text-left py-2 text-xs font-medium text-eastaura-ink-muted">Content</th>
                      <th className="text-left py-2 text-xs font-medium text-eastaura-ink-muted">Channel</th>
                      <th className="text-right py-2 text-xs font-medium text-eastaura-ink-muted">Click Rate</th>
                      <th className="text-right py-2 text-xs font-medium text-eastaura-ink-muted">Lead Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContent.map((item, i) => (
                      <tr key={i} className="border-b border-eastaura-warmgray/50 last:border-0">
                        <td className="py-2.5 text-eastaura-ink font-medium">{item.title}</td>
                        <td className="py-2.5 text-eastaura-ink-muted">{item.channel}</td>
                        <td className="py-2.5 text-right text-eastaura-success font-medium">{item.clicks}</td>
                        <td className="py-2.5 text-right text-eastaura-ink font-medium">{item.leadRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Daily Brief */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Calendar className="w-4 h-4 text-eastaura-gold" />
                Daily Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyBrief.items.map((item, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-eastaura-gold shrink-0" />
                    <p className="text-sm text-eastaura-ink leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Summaries */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-eastaura-sage" />
                  Recent AI Summaries
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAiSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="p-3 rounded-md bg-eastaura-cream-dark border border-eastaura-warmgray/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-eastaura-forest">{summary.leadName}</span>
                      <span className="text-[10px] text-eastaura-ink-muted">{summary.timestamp}</span>
                    </div>
                    <p className="text-xs text-eastaura-ink-light leading-relaxed">{summary.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg bg-eastaura-forest text-eastaura-cream">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-eastaura-gold" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-2xl font-semibold text-eastaura-gold">{dashboardStats.weeklyPublished}</div>
                  <div className="text-xs text-eastaura-sage-light/70">Content Published</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-eastaura-gold">{dashboardStats.formConversionRate}</div>
                  <div className="text-xs text-eastaura-sage-light/70">Form Conversion</div>
                </div>
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
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <Card className="border-eastaura-warmgray shadow-card rounded-lg">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`p-1.5 rounded-md shrink-0 ${
              alert ? "bg-red-50 text-red-600" : "bg-eastaura-sage-muted text-eastaura-forest"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-eastaura-ink-muted truncate">{label}</div>
            <div className={`text-lg font-semibold mt-0.5 ${alert ? "text-red-600" : "text-eastaura-ink"}`}>
              {value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

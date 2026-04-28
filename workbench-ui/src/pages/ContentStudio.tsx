import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Play,
  FileText,
  Mail,
  BookOpen,
  Sparkles,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { contentItems } from "@/data/mock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const channels = ["All", "TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn", "Newsletter", "Blog"];

const topics = [
  { icon: "🌙", label: "Sleep Reset", count: 4 },
  { icon: "🍃", label: "Stress Recovery", count: 3 },
  { icon: "🛡️", label: "No Cure Promise", count: 2 },
  { icon: "🗣️", label: "No Chinese Required", count: 2 },
  { icon: "📅", label: "5-Day 4-Night", count: 3 },
  { icon: "👤", label: "Founder Story", count: 2 },
];

export default function ContentStudio() {
  const [activeChannel, setActiveChannel] = useState("All");
  const [activeTab, setActiveTab] = useState("topic-bank");

  const filteredContent =
    activeChannel === "All"
      ? contentItems
      : contentItems.filter((c) => c.channel === activeChannel);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-eastaura-ink">Content Studio</h1>
          <p className="text-sm text-eastaura-ink-muted mt-0.5">
            Build trust with content, then guide high-intent users to Intake
          </p>
        </div>
        <Button className="bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-1.5">
          <Plus className="w-4 h-4" />
          New Draft
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-eastaura-cream-dark border border-eastaura-warmgray">
          <TabsTrigger value="topic-bank" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
            Topic Bank
          </TabsTrigger>
          <TabsTrigger value="script-drafts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
            Script Drafts
          </TabsTrigger>
          <TabsTrigger value="linkedin-drafts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
            LinkedIn Drafts
          </TabsTrigger>
          <TabsTrigger value="all-drafts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-eastaura-forest">
            All Drafts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Channel Filters */}
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
            {ch}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {activeTab === "topic-bank" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-eastaura-ink">This Week's Topics</CardTitle>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-eastaura-warmgray gap-1">
                    <Plus className="w-3 h-3" /> Add Topic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.label}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border border-eastaura-warmgray bg-eastaura-cream-dark hover:border-eastaura-sage/40 transition-colors cursor-pointer"
                    >
                      <span className="text-2xl mb-1.5">{topic.icon}</span>
                      <span className="text-xs font-medium text-eastaura-ink">{topic.label}</span>
                      <span className="text-[10px] text-eastaura-ink-muted mt-0.5">{topic.count} ideas</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-eastaura-ink">AI-Generated Content Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <DraftsTable items={contentItems.slice(0, 4)} />
              </CardContent>
            </Card>
          </div>

          {/* Agent Panel */}
          <div className="space-y-4">
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-eastaura-sage-muted flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-eastaura-forest" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-eastaura-ink">Content Agent</div>
                    <div className="text-[10px] text-eastaura-ink-muted">Your content operations assistant</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <AgentAction icon={Lightbulb} label="Generate 10 topic ideas" />
                  <AgentAction icon={Play} label="Rewrite as Reels script" />
                  <AgentAction icon={CheckCircle} label="Check high-risk terms" />
                  <AgentAction icon={FileText} label="Generate LinkedIn version" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-eastaura-warmgray shadow-card rounded-lg bg-eastaura-forest text-eastaura-cream">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-eastaura-gold" />
                  <span className="text-xs font-medium text-eastaura-gold">Goal</span>
                </div>
                <p className="text-sm text-eastaura-cream/90 leading-relaxed">
                  The goal is not follower growth. It is high-quality inquiries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {(activeTab === "script-drafts" || activeTab === "linkedin-drafts" || activeTab === "all-drafts") && (
        <Card className="border-eastaura-warmgray shadow-card rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-eastaura-ink">
                {activeTab === "script-drafts" && "Short Video Scripts"}
                {activeTab === "linkedin-drafts" && "LinkedIn Post Drafts"}
                {activeTab === "all-drafts" && "All Content Drafts"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-eastaura-ink-muted" />
                  <input
                    type="text"
                    placeholder="Search drafts..."
                    className="pl-7 pr-2 py-1 text-xs rounded-md border border-eastaura-warmgray bg-white focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20 w-48"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs border-eastaura-warmgray gap-1">
                  <Filter className="w-3 h-3" /> Filter
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
                  : filteredContent
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DraftsTable({ items }: { items: typeof contentItems }) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="w-8 h-8 text-eastaura-warmgray mx-auto mb-3" />
        <p className="text-sm text-eastaura-ink-muted">No drafts found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-eastaura-warmgray">
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Title</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Type</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Channel</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Compliance</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Status</th>
            <th className="text-left py-2.5 pr-4 text-xs font-medium text-eastaura-ink-muted">Source Code</th>
            <th className="text-left py-2.5 text-xs font-medium text-eastaura-ink-muted">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-eastaura-warmgray/50 last:border-0 hover:bg-eastaura-cream-dark/50">
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-2">
                  {item.type === "short_video_script" || item.type === "reels_script" ? (
                    <Play className="w-3.5 h-3.5 text-eastaura-sage shrink-0" />
                  ) : item.type === "linkedin_post" ? (
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : item.type === "newsletter" ? (
                    <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  )}
                  <span className="text-eastaura-ink font-medium truncate max-w-[200px]">{item.title}</span>
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
              <td className="py-2.5 pr-4 text-xs font-mono text-eastaura-ink-muted">{item.sourceCode}</td>
              <td className="py-2.5 text-eastaura-ink-muted">{item.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgentAction({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="w-full flex items-center gap-2.5 p-2.5 rounded-md border border-eastaura-warmgray bg-white hover:border-eastaura-sage/40 hover:bg-eastaura-cream-dark transition-colors text-left group">
      <div className="w-7 h-7 rounded-md bg-eastaura-sage-muted flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-eastaura-forest" />
      </div>
      <span className="text-xs text-eastaura-ink flex-1">{label}</span>
      <ArrowRight className="w-3 h-3 text-eastaura-ink-muted group-hover:text-eastaura-forest transition-colors" />
    </button>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

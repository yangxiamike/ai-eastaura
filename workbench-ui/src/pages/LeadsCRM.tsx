import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Clock,
  ChevronRight,
  Download,
} from "lucide-react";
import { leads } from "@/data/mock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusFilters = ["All", "New", "Contacted", "Qualified", "Consultation Booked", "Proposal Sent", "Won", "Nurture", "Not Fit"];
const riskFilters = ["All Risk", "Low", "Medium", "High"];

export default function LeadsCRM() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All Risk");
  const [sortField, setSortField] = useState<"intentScore" | "lastActivity">("intentScore");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = leads
    .filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.country.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || l.status.replace(/_/g, " ") === statusFilter.toLowerCase().replace(/ /g, "_");
      const matchesRisk = riskFilter === "All Risk" || l.riskLevel === riskFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesRisk;
    })
    .sort((a, b) => {
      if (sortField === "intentScore") {
        return sortAsc ? a.intentScore - b.intentScore : b.intentScore - a.intentScore;
      }
      return 0;
    });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-eastaura-ink">Leads</h1>
          <p className="text-sm text-eastaura-ink-muted mt-0.5">
            {leads.length} total leads · {leads.filter((l) => l.status === "new").length} new this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs border-eastaura-warmgray gap-1">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
              <Input
                placeholder="Search by name, country, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm border-eastaura-warmgray bg-white"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-eastaura-ink-muted" />
                <span className="text-xs text-eastaura-ink-muted">Status:</span>
              </div>
              {statusFilters.slice(0, 5).map((s) => (
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
            <div className="flex items-center gap-2">
              {riskFilters.map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                    riskFilter === r
                      ? "bg-eastaura-forest text-eastaura-cream border-eastaura-forest"
                      : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Table */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-eastaura-warmgray bg-eastaura-cream-dark/50">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Name</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Country</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Goals</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Source</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Status</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Risk</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted cursor-pointer" onClick={() => { setSortField("intentScore"); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center gap-1">
                      Intent <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Last Activity</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-eastaura-ink-muted">Next Action</th>
                  <th className="py-2.5 px-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-eastaura-warmgray/40 last:border-0 hover:bg-eastaura-cream-dark/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <Link to={`/workbench/leads/${lead.id}`} className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-full bg-eastaura-sage-muted flex items-center justify-center text-eastaura-forest text-xs font-medium shrink-0">
                          {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-eastaura-ink font-medium group-hover:text-eastaura-forest transition-colors">{lead.name}</div>
                          <div className="text-[10px] text-eastaura-ink-muted">{lead.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-eastaura-ink-muted">
                        <MapPin className="w-3 h-3" />
                        <span>{lead.country}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {lead.primaryGoals.map((g) => (
                          <span key={g} className="px-1.5 py-0.5 rounded text-[10px] bg-eastaura-sage-muted text-eastaura-forest">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-eastaura-ink-muted">{lead.source}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={lead.status} variant="status" />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={lead.riskLevel} variant="risk" />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-eastaura-warmgray overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              lead.intentScore >= 80 ? "bg-eastaura-success" : lead.intentScore >= 60 ? "bg-eastaura-gold" : "bg-eastaura-ink-muted"
                            )}
                            style={{ width: `${lead.intentScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-eastaura-ink">{lead.intentScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-eastaura-ink-muted">
                        <Clock className="w-3 h-3" />
                        <span>{lead.lastActivity}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-eastaura-ink-light max-w-[140px] truncate">
                      {lead.nextAction}
                    </td>
                    <td className="py-2.5 px-3">
                      <Link to={`/workbench/leads/${lead.id}`}>
                        <ChevronRight className="w-4 h-4 text-eastaura-ink-muted hover:text-eastaura-forest" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-eastaura-warmgray mx-auto mb-3" />
              <p className="text-sm text-eastaura-ink-muted">No leads match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

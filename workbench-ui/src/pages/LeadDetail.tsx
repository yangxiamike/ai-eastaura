import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Heart,
  Shield,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Clock,
  Mail,
  Video,
  XCircle,
  Send,
  CheckSquare,
  ExternalLink,
  Sparkles,
  FileText,
  HelpCircle,
  Stethoscope,
  Pill,
} from "lucide-react";
import { leads } from "@/data/mock";
import { cn } from "@/lib/utils";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <User className="w-12 h-12 text-eastaura-warmgray mx-auto mb-4" />
        <h2 className="text-lg font-medium text-eastaura-ink">Lead not found</h2>
        <p className="text-sm text-eastaura-ink-muted mt-2">The lead you're looking for doesn't exist.</p>
        <Link to="/workbench/leads" className="text-sm text-eastaura-forest hover:underline mt-4 inline-block">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/workbench/leads" className="text-eastaura-ink-muted hover:text-eastaura-forest flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Leads
        </Link>
        <span className="text-eastaura-warmgray">/</span>
        <span className="text-eastaura-ink font-medium">{lead.name}</span>
      </div>

      {/* Header Card */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 rounded-full bg-eastaura-forest flex items-center justify-center text-eastaura-cream text-lg font-medium shrink-0">
                {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-lg font-semibold text-eastaura-ink">{lead.name}</h1>
                  {lead.status === "qualified" && (
                    <span className="flex items-center gap-1 text-xs text-eastaura-success">
                      <CheckCircle className="w-3.5 h-3.5" /> AI Reviewed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-eastaura-ink-muted">
                  <span>{lead.country}</span>
                  <span>·</span>
                  <span>{lead.age} years old</span>
                  <span>·</span>
                  <span>{lead.email}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {lead.primaryGoals.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full text-[11px] bg-eastaura-sage-muted text-eastaura-forest font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Score Cards */}
            <div className="flex gap-3">
              <ScoreCard icon={Heart} label="Intent" value={`${lead.intentScore}/100`} color="text-eastaura-success" />
              <ScoreCard icon={Shield} label="Fit" value={`${Math.round(lead.intentScore * 0.9)}/100`} color="text-eastaura-forest" />
              <ScoreCard
                icon={AlertTriangle}
                label="Risk"
                value={`${lead.riskLevel === "low" ? "1" : lead.riskLevel === "medium" ? "3" : "5"}/5`}
                color={lead.riskLevel === "high" ? "text-red-600" : lead.riskLevel === "medium" ? "text-eastaura-warning" : "text-eastaura-success"}
              />
              <ScoreCard icon={Wallet} label="Budget" value={lead.budget || "—"} color="text-eastaura-ink" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Summary */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-eastaura-sage" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-eastaura-ink-light leading-relaxed">{lead.aiSummary}</p>
            </CardContent>
          </Card>

          {/* Intake Details */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-eastaura-forest" />
                Intake Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.intakeDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IntakeField icon={Target} label="Goals" value={lead.intakeDetails.goals} />
                  <IntakeField icon={HelpCircle} label="Concerns" value={lead.intakeDetails.concerns} />
                  <IntakeField icon={Clock} label="Timeline" value={lead.intakeDetails.timeline} />
                  <IntakeField icon={Sparkles} label="Previous Experience" value={lead.intakeDetails.previousExperience} />
                  <IntakeField icon={Stethoscope} label="Medical Conditions" value={lead.intakeDetails.medicalConditions.join(", ") || "None reported"} alert={lead.intakeDetails.medicalConditions.length > 0} />
                  <IntakeField icon={Pill} label="Medications" value={lead.intakeDetails.medications.join(", ") || "None reported"} alert={lead.intakeDetails.medications.length > 0} />
                  <IntakeField icon={Mail} label="Preferred Contact" value={lead.intakeDetails.preferredContact} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Notes */}
          {lead.riskNotes && lead.riskNotes.length > 0 && (
            <Card className="border-red-200 shadow-card rounded-lg bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.riskNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Next Steps */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Flag className="w-4 h-4 text-eastaura-gold" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <NextStep number={1} text={lead.nextAction} active />
                {lead.status === "qualified" && (
                  <NextStep number={2} text="If suitable, send video consultation link" />
                )}
                {lead.status === "consultation_booked" && (
                  <NextStep number={2} text="Prepare personalized proposal post-consultation" />
                )}
                <NextStep number={3} text="Generate proposal after video call" />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-eastaura-forest" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {lead.timeline?.map((entry, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                    {i < (lead.timeline?.length || 0) - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-px bg-eastaura-warmgray" />
                    )}
                    <div className="w-3.5 h-3.5 rounded-full bg-eastaura-sage border-2 border-eastaura-cream shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-eastaura-ink-muted">{entry.date}</div>
                      <div className="text-sm text-eastaura-ink mt-0.5">{entry.action}</div>
                      <div className="text-[10px] text-eastaura-ink-muted mt-0.5">by {entry.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Source Attribution */}
          {lead.sourceAttribution && (
            <Card className="border-eastaura-warmgray shadow-card rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-eastaura-forest" />
                  Source Attribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <AttributionField label="Campaign" value={lead.sourceAttribution.campaign} />
                  <AttributionField label="Content Item" value={lead.sourceAttribution.contentItem} />
                  <AttributionField label="Channel" value={lead.sourceAttribution.channel} />
                  <AttributionField label="UTM Source" value={lead.sourceAttribution.utmSource} code />
                  <AttributionField label="UTM Medium" value={lead.sourceAttribution.utmMedium} code />
                  <AttributionField label="UTM Campaign" value={lead.sourceAttribution.utmCampaign} code />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft Follow-up Email */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-eastaura-forest" />
                Draft Follow-up Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md bg-eastaura-cream-dark border border-eastaura-warmgray/50">
                <div className="text-xs text-eastaura-ink-muted mb-2">Subject: Your Eastaura intake — next steps</div>
                <div className="text-sm text-eastaura-ink-light leading-relaxed space-y-2">
                  <p>Hi {lead.name.split(" ")[0]},</p>
                  <p>Thank you for sharing your goals with us. Based on what you described — {lead.primaryGoals.join(", ")} — Eastaura could be a meaningful fit.</p>
                  <p>A few questions to make sure we are the right choice:</p>
                  <ul className="list-disc list-inside text-eastaura-ink-muted">
                    <li>What is your preferred travel window?</li>
                    <li>Have you experienced TCM or acupuncture before?</li>
                    <li>Are you currently under any medical supervision?</li>
                  </ul>
                  <p>If this resonates, the next step is a 20-minute video consultation where we discuss your timeline and what the 5-day structure would look like for your situation.</p>
                  <p className="text-eastaura-ink font-medium">No pressure. Just clarity.</p>
                  <p>Warmly,<br />Eastaura Team</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-5">
          {/* Actions */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4 space-y-2.5">
              <Button className="w-full bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-2">
                <CheckSquare className="w-4 h-4" /> Mark Qualified
              </Button>
              <Button variant="outline" className="w-full border-eastaura-warmgray gap-2">
                <Video className="w-4 h-4" /> Book Consultation
              </Button>
              <Button variant="outline" className="w-full border-eastaura-warmgray gap-2">
                <Send className="w-4 h-4" /> Send Follow-up Draft
              </Button>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2">
                <XCircle className="w-4 h-4" /> Mark Not Fit
              </Button>
            </CardContent>
          </Card>

          {/* Lead Agent */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-eastaura-sage-muted flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-eastaura-forest" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-eastaura-ink">Lead Agent</div>
                  <div className="text-[10px] text-eastaura-ink-muted">Your AI assistant for lead handling</div>
                </div>
              </div>
              <div className="space-y-2">
                <AgentButton icon={FileText} label="Generate Lead Summary" />
                <AgentButton icon={Mail} label="Write Follow-up Email" />
                <AgentButton icon={HelpCircle} label="Generate Consult Questions" />
                <AgentButton icon={FileText} label="Draft Proposal" />
                <AgentButton icon={Shield} label="Check Risk Boundaries" />
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-eastaura-gold" />
                <span className="text-xs font-medium text-eastaura-gold">Note</span>
              </div>
              <p className="text-xs text-eastaura-ink-muted leading-relaxed">
                AI recommendations are for reference only. Important decisions require your final confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-eastaura-warmgray bg-eastaura-cream-dark min-w-[72px]">
      <Icon className={cn("w-4 h-4 mb-1", color)} />
      <span className="text-xs text-eastaura-ink-muted">{label}</span>
      <span className={cn("text-sm font-semibold mt-0.5", color)}>{value}</span>
    </div>
  );
}

function IntakeField({ icon: Icon, label, value, alert }: { icon: React.ElementType; label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", alert ? "text-red-500" : "text-eastaura-sage")} />
      <div>
        <div className={cn("text-[11px] font-medium", alert ? "text-red-600" : "text-eastaura-ink-muted")}>{label}</div>
        <div className={cn("text-sm mt-0.5", alert ? "text-red-700" : "text-eastaura-ink-light")}>{value}</div>
      </div>
    </div>
  );
}

function NextStep({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5",
          active ? "bg-eastaura-forest text-eastaura-cream" : "bg-eastaura-warmgray text-eastaura-ink-muted"
        )}
      >
        {number}
      </div>
      <span className={cn("text-sm", active ? "text-eastaura-ink font-medium" : "text-eastaura-ink-muted")}>{text}</span>
    </div>
  );
}

function AttributionField({ label, value, code }: { label: string; value: string; code?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-eastaura-ink-muted uppercase tracking-wider">{label}</div>
      <div className={cn("text-xs mt-0.5", code ? "font-mono text-eastaura-forest" : "text-eastaura-ink-light")}>{value}</div>
    </div>
  );
}

function AgentButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="w-full flex items-center gap-2.5 p-2.5 rounded-md border border-eastaura-warmgray bg-white hover:border-eastaura-sage/40 hover:bg-eastaura-cream-dark transition-colors text-left group">
      <div className="w-7 h-7 rounded-md bg-eastaura-sage-muted flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-eastaura-forest" />
      </div>
      <span className="text-xs text-eastaura-ink flex-1">{label}</span>
      <ArrowLeft className="w-3 h-3 text-eastaura-ink-muted rotate-180 group-hover:text-eastaura-forest transition-colors" />
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

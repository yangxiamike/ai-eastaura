"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
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
  Clock,
  Mail,
  Video,
  XCircle,
  HelpCircle,
  Stethoscope,
  Pill,
  Sparkles,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import type { Lead } from "@/lib/workbench/types";
import {
  addLeadNote,
  exportLeadCsv,
  getLeadAvatar,
  getLeadDetail,
  getLeadGoals,
  rerunLeadTriage,
  updateLeadStatus,
  type ApiMeta,
  type LeadStatus,
  type WorkbenchEvent,
  type WorkbenchNote,
} from "@/lib/workbench/client-api";

const statusOptions: LeadStatus[] = ["triaged", "contacted", "qualified", "not_fit"];

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<WorkbenchNote[]>([]);
  const [events, setEvents] = useState<WorkbenchEvent[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isTriageRunning, setIsTriageRunning] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [actionError, setActionError] = useState("");

  const loadLead = useCallback(() => {
    getLeadDetail(id)
      .then((data) => {
        const leadFromResponse = data.lead ?? null;
        const hasMismatchedFallbackLead = Boolean(data.usingFallback && leadFromResponse?.id && leadFromResponse.id !== id);

        setLead(hasMismatchedFallbackLead ? null : leadFromResponse);
        setNotes(hasMismatchedFallbackLead ? [] : data.notes ?? []);
        setEvents(hasMismatchedFallbackLead ? [] : [...(data.statusEvents ?? []), ...(data.leadEvents ?? [])]);
        setMeta({ usingFallback: data.usingFallback, error: data.error });
      })
      .catch((error: unknown) => {
        setLead(null);
        setMeta({ error: error instanceof Error ? error.message : "Failed to load lead detail." });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const timeline = useMemo(() => {
    const apiEvents = events.map((event) => ({
      date: event.createdAt || event.date || "",
      action: event.message || event.action || event.type || event.status || "Lead event",
      by: event.by || "System",
    }));
    return [...apiEvents, ...(lead?.timeline ?? [])].filter((entry) => entry.action);
  }, [events, lead?.timeline]);

  const handleStatus = async (status: LeadStatus) => {
    setIsSavingStatus(true);
    setActionError("");
    try {
      const data = await updateLeadStatus(id, status, `Workbench status update: ${status}`);
      if (data.lead) setLead(data.lead);
      await loadLead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Status update failed.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteBody.trim()) return;
    setIsAddingNote(true);
    setActionError("");
    try {
      const data = await addLeadNote(id, noteBody.trim());
      if (data.notes) setNotes(data.notes);
      if (data.note) setNotes((current) => [data.note!, ...current]);
      setNoteBody("");
      await loadLead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Adding note failed.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleTriage = async () => {
    setIsTriageRunning(true);
    setActionError("");
    try {
      const data = await rerunLeadTriage(id);
      if (data.lead) setLead(data.lead);
      await loadLead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Triage retry failed.");
    } finally {
      setIsTriageRunning(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    setActionError("");
    try {
      const { blob, filename } = await exportLeadCsv(id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "CSV export failed.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-eastaura-warmgray shadow-card">
        <CardContent className="py-12 text-center text-sm text-eastaura-ink-muted">Loading lead detail...</CardContent>
      </Card>
    );
  }

  if (!lead) {
    return (
      <div className="py-12 text-center">
        <User className="w-12 h-12 text-eastaura-warmgray mx-auto mb-4" />
        <h2 className="text-lg font-medium text-eastaura-ink">Lead not found</h2>
        <p className="text-sm text-eastaura-ink-muted mt-2">{meta.error || "The lead you're looking for doesn't exist."}</p>
        <Link href="/workbench/leads" className="text-sm text-eastaura-forest hover:underline mt-4 inline-block">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/workbench/leads" className="text-eastaura-ink-muted hover:text-eastaura-forest flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Leads
        </Link>
        <span className="text-eastaura-warmgray">/</span>
        <span className="text-eastaura-ink font-medium">{lead.name}</span>
      </div>

      {(meta.error || meta.usingFallback || actionError) && (
        <Card className="border-eastaura-warmgray shadow-card">
          <CardContent className="py-3 text-sm text-eastaura-ink-muted">
            {meta.usingFallback && !meta.error && "Showing fallback workbench data."}
            {meta.error && <span className="text-red-600">Lead detail returned a warning: {meta.error}</span>}
            {actionError && <span className="text-red-600">{actionError}</span>}
          </CardContent>
        </Card>
      )}

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-eastaura-warmgray shrink-0">
                <Image src={getLeadAvatar(lead)} alt={lead.name} width={64} height={64} className="w-full h-full object-cover" />
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
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-eastaura-ink-muted">
                  <span>{lead.country}</span>
                  <span>-</span>
                  <span>{lead.age ? `${lead.age} years old` : "Age TBD"}</span>
                  <span>-</span>
                  <span>{lead.email}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {getLeadGoals(lead).map((goal) => (
                    <span key={goal} className="px-2 py-0.5 rounded-full text-[11px] bg-eastaura-sage-muted text-eastaura-forest font-medium">
                      {goal}
                    </span>
                  ))}
                  {getLeadGoals(lead).length === 0 && <span className="text-xs text-eastaura-ink-muted">No goals yet</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto">
              <ScoreCard icon={Heart} label="Intent" value={`${lead.intentScore ?? 0}/100`} color="text-eastaura-success" />
              <ScoreCard icon={Shield} label="Fit" value={`${Math.round((lead.intentScore ?? 0) * 0.9)}/100`} color="text-eastaura-forest" />
              <ScoreCard
                icon={AlertTriangle}
                label="Risk"
                value={`${lead.riskLevel === "low" ? "1" : lead.riskLevel === "medium" ? "3" : "5"}/5`}
                color={lead.riskLevel === "high" ? "text-red-600" : lead.riskLevel === "medium" ? "text-eastaura-warning" : "text-eastaura-success"}
              />
              <ScoreCard icon={Wallet} label="Budget" value={lead.budget || "TBD"} color="text-eastaura-ink" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-eastaura-sage" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-eastaura-ink-light leading-relaxed">{lead.aiSummary || "No AI summary yet."}</p>
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-eastaura-forest" />
                Intake Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.intakeDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IntakeField icon={Target} label="Goals" value={lead.intakeDetails.goals} />
                  <IntakeField icon={HelpCircle} label="Concerns" value={lead.intakeDetails.concerns} />
                  <IntakeField icon={Clock} label="Timeline" value={lead.intakeDetails.timeline} />
                  <IntakeField icon={Sparkles} label="Previous Experience" value={lead.intakeDetails.previousExperience} />
                  <IntakeField icon={Stethoscope} label="Medical Conditions" value={lead.intakeDetails.medicalConditions.join(", ") || "None reported"} alert={lead.intakeDetails.medicalConditions.length > 0} />
                  <IntakeField icon={Pill} label="Medications" value={lead.intakeDetails.medications.join(", ") || "None reported"} alert={lead.intakeDetails.medications.length > 0} />
                  <IntakeField icon={Mail} label="Preferred Contact" value={lead.intakeDetails.preferredContact} />
                </div>
              ) : (
                <div className="text-sm text-eastaura-ink-muted">No intake details available.</div>
              )}
            </CardContent>
          </Card>

          {(lead.riskNotes?.length ?? 0) > 0 && (
            <Card className="border-red-200 shadow-card rounded-lg bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.riskNotes?.map((note) => (
                    <div key={note} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Flag className="w-4 h-4 text-eastaura-gold" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <NextStep number={1} text={lead.nextAction || "Review intake and choose next status."} active />
                {lead.status === "qualified" && <NextStep number={2} text="If suitable, send video consultation link" />}
                {lead.status === "consultation_booked" && <NextStep number={2} text="Prepare personalized proposal post-consultation" />}
                <NextStep number={3} text="Generate proposal after video call" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-eastaura-forest" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((entry, index) => (
                    <div key={`${entry.date}-${entry.action}-${index}`} className="flex gap-3 pb-4 last:pb-0 relative">
                      {index < timeline.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-px bg-eastaura-warmgray" />}
                      <div className="w-3.5 h-3.5 rounded-full bg-eastaura-sage border-2 border-eastaura-cream shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-eastaura-ink-muted">{entry.date || "Just now"}</div>
                        <div className="text-sm text-eastaura-ink mt-0.5">{entry.action}</div>
                        <div className="text-[10px] text-eastaura-ink-muted mt-0.5">by {entry.by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-eastaura-ink-muted">No activity yet.</div>
              )}
            </CardContent>
          </Card>

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

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-eastaura-forest" />
                Draft Follow-up Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md bg-eastaura-cream-dark border border-eastaura-warmgray/50">
                <div className="text-xs text-eastaura-ink-muted mb-2">Subject: Your Eastaura intake - next steps</div>
                <div className="text-sm text-eastaura-ink-light leading-relaxed space-y-2">
                  <p>Hi {lead.name.split(" ")[0]},</p>
                  <p>Thank you for sharing your goals with us. Based on what you described - {getLeadGoals(lead).join(", ") || "your recovery goals"} - Eastaura could be a meaningful fit.</p>
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

        <div className="space-y-5">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink">Lead Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={lead.status === status ? "default" : "outline"}
                    className={cn(
                      "h-8 text-xs",
                      lead.status === status
                        ? "bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light"
                        : "border-eastaura-warmgray"
                    )}
                    disabled={isSavingStatus}
                    onClick={() => handleStatus(status)}
                  >
                    {status.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
              <Button variant="outline" className="w-full border-eastaura-warmgray gap-2" disabled={isTriageRunning} onClick={handleTriage}>
                <Sparkles className="w-4 h-4" /> {isTriageRunning ? "Running triage..." : "Re-run AI triage"}
              </Button>
              <Button variant="outline" className="w-full border-eastaura-warmgray gap-2" disabled={isExportingCsv} onClick={handleExportCsv}>
                <Download className="w-4 h-4" /> {isExportingCsv ? "Exporting CSV..." : "Export CSV"}
              </Button>
              <Button className="w-full bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-2">
                <Video className="w-4 h-4" /> Invite Video Consultation
              </Button>
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder="Add a founder note..."
                className="min-h-24 w-full rounded-md border border-eastaura-warmgray bg-white p-3 text-sm text-eastaura-ink outline-none focus:border-eastaura-sage"
              />
              <Button className="h-8 bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light" disabled={isAddingNote || !noteBody.trim()} onClick={handleAddNote}>
                {isAddingNote ? "Saving note..." : "Add note"}
              </Button>
              <div className="space-y-2">
                {notes.length === 0 && <div className="rounded-md border border-dashed border-eastaura-warmgray p-3 text-xs text-eastaura-ink-muted">No notes yet.</div>}
                {notes.map((note, index) => (
                  <div key={note.id || `${note.createdAt}-${index}`} className="rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark p-3">
                    <div className="text-xs text-eastaura-ink-muted">{note.author || "Founder"} · {note.createdAt || "Just now"}</div>
                    <div className="mt-1 text-sm text-eastaura-ink-light">{note.body}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4">
              <AgentPanel
                title="Lead Agent"
                subtitle="Your AI assistant for lead handling"
                actions={[
                  { icon: FileText, label: "Generate Lead Summary" },
                  { icon: Mail, label: "Write Follow-up Email" },
                  { icon: HelpCircle, label: "Generate Consult Questions" },
                  { icon: Shield, label: "Check Risk Boundaries" },
                ]}
                note="AI recommendations are for reference only. Important decisions require your final confirmation."
                noteTitle="Note"
              />
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

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

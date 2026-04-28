"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/workbench/LanguageProvider";

interface StatusBadgeProps {
  status: string;
  variant?: "status" | "risk" | "priority" | "compliance" | "publish" | "notification";
  className?: string;
}

const statusConfig: Record<string, Record<string, { bg: string; text: string; border: string; label: string }>> = {
  status: {
    new: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-sage-light/30", label: "New" },
    triaged: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-gold", border: "border-eastaura-gold-light/30", label: "Triaged" },
    needs_review: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Needs Review" },
    contacted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Contacted" },
    qualified: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-gold", border: "border-eastaura-gold-light/30", label: "Qualified" },
    consultation_booked: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Consultation Booked" },
    proposal_sent: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-forest", border: "border-eastaura-sage/30", label: "Proposal Sent" },
    won: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-success/30", label: "Won" },
    not_fit: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Not Fit" },
    nurture: { bg: "bg-eastaura-warmgray-light", text: "text-eastaura-ink-muted", border: "border-eastaura-warmgray", label: "Nurture" },
  },
  risk: {
    low: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-sage-light/30", label: "Low" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Medium" },
    high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "High" },
  },
  priority: {
    low: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Low" },
    medium: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-warning", border: "border-eastaura-gold-light/30", label: "Medium" },
    high: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "High" },
    urgent: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Urgent" },
  },
  compliance: {
    pending: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-warning", border: "border-eastaura-gold-light/30", label: "Pending" },
    approved: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-sage-light/30", label: "Approved" },
    flagged: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Flagged" },
    rejected: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Rejected" },
  },
  publish: {
    draft: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Draft" },
    review: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-warning", border: "border-eastaura-gold-light/30", label: "Review" },
    scheduled: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Scheduled" },
    published: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-sage-light/30", label: "Published" },
    idea: { bg: "bg-eastaura-warmgray-light", text: "text-eastaura-ink-muted", border: "border-eastaura-warmgray", label: "Idea" },
  },
  notification: {
    pending: { bg: "bg-eastaura-gold-muted", text: "text-eastaura-warning", border: "border-eastaura-gold-light/30", label: "Pending" },
    sent: { bg: "bg-eastaura-sage-muted", text: "text-eastaura-success", border: "border-eastaura-sage-light/30", label: "Sent" },
    failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Failed" },
    skipped: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Skipped" },
  },
};

export function StatusBadge({ status, variant = "status", className }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = statusConfig[variant]?.[status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {t(config.label)}
    </span>
  );
}

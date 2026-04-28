"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/workbench/LanguageProvider";

type FocusItemBase = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
};

interface FocusListPanelProps<T extends FocusItemBase> {
  title: string;
  description?: string;
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderDetail: (item: T) => ReactNode;
  emptyLabel: string;
  actionLabel?: string;
  onAction?: () => void;
  maxVisible?: number;
}

export function FocusListPanel<T extends FocusItemBase>({
  title,
  description,
  items,
  selectedId,
  onSelect,
  renderDetail,
  emptyLabel,
  actionLabel,
  onAction,
  maxVisible = 4,
}: FocusListPanelProps<T>) {
  const { t } = useLanguage();
  const visibleItems = items.slice(0, Math.max(1, Math.min(maxVisible, 4)));
  const selectedItem = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];
  const badgeLabels: Record<string, string> = {
    draft: "Draft",
    review: "Review",
    scheduled: "Scheduled",
    published: "Published",
    pending: "Pending",
    approved: "Approved",
    flagged: "Flagged",
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <Card className="border-eastaura-warmgray shadow-card">
      <CardHeader className="border-b border-eastaura-warmgray/70 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="break-words">{title}</CardTitle>
            {description && <p className="mt-1 break-words text-sm text-eastaura-ink-muted">{description}</p>}
          </div>
          {actionLabel && onAction && (
            <Button size="sm" variant="outline" className="h-8 gap-1 border-eastaura-warmgray text-xs" onClick={onAction}>
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {items.length === 0 || !selectedItem ? (
          <div className="rounded-md border border-dashed border-eastaura-warmgray p-6 text-sm text-eastaura-ink-muted">
            {emptyLabel}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="space-y-2">
              {visibleItems.map((item, index) => {
                const isActive = item.id === selectedItem.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "w-full min-w-0 rounded-md border p-3 text-left transition-colors",
                      isActive
                        ? "border-eastaura-forest/40 bg-eastaura-sage-muted/50"
                        : "border-eastaura-warmgray bg-white hover:border-eastaura-sage/50"
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-eastaura-ink-muted">#{index + 1}</span>
                      {item.badge && (
                        <span className="rounded-full bg-eastaura-gold-muted px-2 py-0.5 text-[11px] text-eastaura-forest">
                          {t(badgeLabels[item.badge] ?? item.badge)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium text-eastaura-ink">{item.title}</p>
                    {item.subtitle && (
                      <p className="mt-1 break-words text-xs text-eastaura-ink-muted">{item.subtitle}</p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="min-w-0 rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark p-4 break-words">
              {renderDetail(selectedItem)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Search, Calendar, Plus, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import { languageNames, type WorkbenchLanguage } from "@/lib/workbench/i18n";

export function TopBar() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const today = new Date().toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 bg-eastaura-cream/85 backdrop-blur-md border-b border-eastaura-warmgray">
      <div className="flex h-16 items-center justify-between pl-14 pr-4 lg:px-8">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eastaura-ink-muted" />
            <input
              type="text"
              placeholder={t("Search leads, campaigns, skills...")}
              className="h-11 w-full rounded-md border border-eastaura-warmgray bg-white pl-10 pr-3 text-[15px] focus:border-eastaura-forest/30 focus:outline-none focus:ring-1 focus:ring-eastaura-forest/30 placeholder:text-eastaura-ink-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-sm text-eastaura-ink-muted md:flex">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>
          <Button
            size="sm"
            className="hidden h-9 items-center gap-1.5 bg-eastaura-forest text-eastaura-cream hover:bg-eastaura-forest-light sm:flex"
            onClick={() => {
              setFeedback(t("Lead triage workspace queued for the next qualified intake."));
              window.setTimeout(() => setFeedback(null), 2400);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{t("Triage Lead")}</span>
          </Button>
          <div className="flex shrink-0 items-center gap-1 rounded-md border border-eastaura-warmgray bg-white p-0.5" aria-label={t("Language")}>
            {(["zh", "en"] as WorkbenchLanguage[]).map((option) => (
              <button
                key={option}
                onClick={() => setLanguage(option)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                  language === option
                    ? "bg-eastaura-forest text-eastaura-cream"
                    : "text-eastaura-ink-muted hover:bg-eastaura-cream-dark"
                }`}
                aria-pressed={language === option}
              >
                {languageNames[option]}
              </button>
            ))}
          </div>
          <button className="relative p-1.5 rounded-md hover:bg-eastaura-warmgray-light text-eastaura-ink-muted">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-eastaura-warmgray-light text-eastaura-ink-muted">
            <HelpCircle className="w-4 h-4" />
          </button>
          <Image
            src="/workbench/avatars/founder.jpg"
            alt={t("Founder")}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover hidden sm:block"
          />
        </div>
      </div>
      {feedback && (
        <div className="absolute right-6 top-[52px] rounded-md border border-eastaura-sage/30 bg-white px-3 py-2 text-xs text-eastaura-ink shadow-card">
          {feedback}
        </div>
      )}
    </header>
  );
}

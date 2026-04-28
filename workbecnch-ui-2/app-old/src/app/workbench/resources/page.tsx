"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Video,
  ImageIcon,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";

const resources = [
  {
    category: "Partner Readiness",
    items: [
      { title: "TCM clinic credential checklist", type: "DOC", size: "Versioned", icon: FileText },
      { title: "English interpreter roster", type: "Sheet", size: "Owner review", icon: ExternalLink },
      { title: "Hotel and transfer partner shortlist", type: "Sheet", size: "Pilot", icon: ExternalLink },
    ],
  },
  {
    category: "Pilot Offer Assets",
    items: [
      { title: "5-day Shanghai + Hangzhou itinerary", type: "PDF", size: "Draft", icon: FileText },
      { title: "Safety intake question set", type: "DOC", size: "P0", icon: FileText },
      { title: "Non-medical disclaimer copy", type: "DOC", size: "Approved", icon: FileText },
      { title: "Consultation fit call notes", type: "DOC", size: "Template", icon: FileText },
    ],
  },
  {
    category: "Content Asset Library",
    items: [
      { title: "Shanghai arrival POV b-roll", type: "MP4", size: "Needed", icon: Video },
      { title: "Hangzhou tea and rest scenes", type: "MP4", size: "Needed", icon: Video },
      { title: "Founder trust portrait set", type: "JPG", size: "Needed", icon: ImageIcon },
      { title: "Clinic room and translator b-roll", type: "MP4", size: "Partner approval", icon: Video },
    ],
  },
];

export default function Resources() {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-none space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Partners & Assets")}</h1>
        <p className="mt-1 text-base text-eastaura-ink-muted">
          {t("Partner checklist, pilot offer materials, and content assets for the Shanghai + Hangzhou MVP")}
        </p>
      </div>

      {/* Hero Image */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg overflow-hidden">
        <div className="relative h-40">
          <Image
            src="/workbench/brand-illustration.jpg"
            alt="Eastaura"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-eastaura-forest/70 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h2 className="text-lg font-semibold text-eastaura-cream">{t("Pilot Operations Library")}</h2>
            <p className="text-xs text-eastaura-cream/70 mt-1">{t("Keep partner evidence, safety copy, and campaign assets review-ready")}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        {resources.map((section) => (
          <Card key={section.category} className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-eastaura-forest" />
                {t(section.category)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item) => (
                  <button
                    key={item.title}
                    className="flex items-center gap-3 p-3 rounded-lg border border-eastaura-warmgray bg-white hover:border-eastaura-sage/40 hover:bg-eastaura-cream-dark transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-md bg-eastaura-sage-muted flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-eastaura-forest" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-eastaura-ink truncate">{item.title}</p>
                      <p className="text-[10px] text-eastaura-ink-muted">{item.type} - {item.size}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-eastaura-ink-muted group-hover:text-eastaura-forest transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

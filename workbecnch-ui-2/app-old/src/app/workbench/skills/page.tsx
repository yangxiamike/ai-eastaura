"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Shield,
  Target,
  Users,
  TrendingUp,
  Save,
  RotateCcw,
  FileText,
  ChevronRight,
} from "lucide-react";
import { skillFiles } from "@/lib/workbench/mock-data";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/workbench/LanguageProvider";

const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Foundation: { icon: BookOpen, color: "text-eastaura-forest" },
  Compliance: { icon: Shield, color: "text-red-500" },
  Marketing: { icon: Target, color: "text-blue-500" },
  Operations: { icon: Users, color: "text-eastaura-warning" },
  Growth: { icon: TrendingUp, color: "text-purple-500" },
};

const categories = ["All", "Foundation", "Compliance", "Marketing", "Operations", "Growth"];

export default function SkillsTemplates() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(skillFiles[0]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [editedContent, setEditedContent] = useState(selectedFile.content);
  const [hasChanges, setHasChanges] = useState(false);

  const filteredFiles =
    activeCategory === "All" ? skillFiles : skillFiles.filter((f) => f.category === activeCategory);

  const handleFileSelect = (file: typeof skillFiles[0]) => {
    if (hasChanges) {
      // In a real app, show a confirmation dialog
    }
    setSelectedFile(file);
    setEditedContent(file.content);
    setHasChanges(false);
  };

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // In a real app, this would save to backend
  };

  const handleReset = () => {
    setEditedContent(selectedFile.content);
    setHasChanges(false);
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Skills & Templates")}</h1>
        <p className="mt-1 text-base text-eastaura-ink-muted">
          {t("Business knowledge files that guide AI behavior and content quality")}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeCategory === cat
                ? "bg-eastaura-forest text-eastaura-cream border-eastaura-forest"
                : "bg-white text-eastaura-ink-muted border-eastaura-warmgray hover:border-eastaura-sage/50"
            )}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-eastaura-warmgray/50">
                {filteredFiles.map((file) => {
                  const config = categoryConfig[file.category] || { icon: FileText, color: "text-eastaura-forest" };
                  const Icon = config.icon;
                  const isSelected = selectedFile.id === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 text-left transition-colors",
                        isSelected ? "bg-eastaura-cream-dark border-l-2 border-l-eastaura-forest" : "hover:bg-eastaura-cream-dark/30 border-l-2 border-l-transparent"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", config.color)} />
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-sm font-medium", isSelected ? "text-eastaura-forest" : "text-eastaura-ink")}>
                          {file.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-eastaura-warmgray-light text-eastaura-ink-muted">
                            {t(file.category)}
                          </span>
                          <span className="text-[10px] text-eastaura-ink-muted">
                            {file.updatedAt}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 shrink-0 mt-0.5", isSelected ? "text-eastaura-forest" : "text-eastaura-warmgray")} />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-sm font-semibold text-eastaura-ink">{selectedFile.name}</CardTitle>
                  {hasChanges && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-eastaura-gold-muted text-eastaura-warning font-medium">
                      {t("Unsaved changes")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-eastaura-warmgray gap-1"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-3 h-3" /> {t("Reset")}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-1"
                    onClick={handleSave}
                  >
                    <Save className="w-3 h-3" /> {t("Save")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-[600px] p-4 rounded-md border border-eastaura-warmgray bg-white text-sm leading-relaxed text-eastaura-ink-light font-mono resize-none focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20 focus:border-eastaura-forest/30"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

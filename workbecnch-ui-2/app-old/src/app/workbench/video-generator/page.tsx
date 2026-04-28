"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clapperboard,
  Wand2,
  Camera,
  ShieldAlert,
  Save,
  Lightbulb,
  Scissors,
  FileOutput,
  Play,
  Clock,
  PenTool,
  Film,
} from "lucide-react";
import { videoScenes } from "@/lib/workbench/mock-data";
import {
  createContentAsset,
  generateContentScript,
  generateContentStoryboard,
  getContentAssets,
  runContentComplianceReview,
} from "@/lib/workbench/client-api";
import { AgentPanel } from "@/components/workbench/AgentPanel";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";
import type { ContentItem, Scene } from "@/lib/workbench/types";

export default function VideoGenerator() {
  const { t } = useLanguage();
  const [topic, setTopic] = useState("POV: Fly into Shanghai, slow down in Hangzhou for a 5-day TCM Wellness Reset");
  const [audience, setAudience] = useState("US/EU professionals aged 35-60 with stress, poor sleep, and low recovery");
  const [painPoint, setPainPoint] = useState("Ordinary vacations do not restore sleep rhythm or mental overload");
  const [cta, setCta] = useState("Start the safety intake for the pilot retreat");
  const [forbidden, setForbidden] = useState("cure, heal, fix, treat, guaranteed, doctor-approved");
  const [asset, setAsset] = useState<ContentItem | null>(null);
  const [scenes, setScenes] = useState<Scene[]>(videoScenes);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getContentAssets()
      .then((payload) => {
        if (cancelled) return;
        const shortVideo = payload.assets?.find((item) => item.type === "short_video_script" || item.type === "reels_script");
        if (shortVideo) {
          setAsset(shortVideo);
          setTopic(shortVideo.title);
          if (shortVideo.body) {
            setPainPoint(shortVideo.body.slice(0, 180));
          }
        }
        if (payload.usingFallback) {
          setFeedback(t("Using fallback video brief because root API is unavailable."));
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : t("Failed to load video asset.")));

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function ensureAsset() {
    if (asset) {
      return asset;
    }

    const payload = await createContentAsset({
      title: topic,
      type: "short_video_script",
      channel: "Instagram Reels",
      campaign: "POV Video Pipeline",
      cta,
      body: `${audience}\n\n${painPoint}`,
      topics: ["POV", "Shanghai", "Hangzhou"],
    });
    const created = payload.asset ?? null;
    setAsset(created);
    return created;
  }

  async function handleGenerateScript() {
    const current = await ensureAsset();
    if (!current) return;
    const payload = await generateContentScript(current.id, { topic, audience, painPoint, cta, forbidden });
    if (payload.asset) {
      setAsset(payload.asset);
    }
    setFeedback(payload.usingFallback ? t("Generated a local Reels script draft.") : t("Generated a script draft from root API."));
  }

  async function handleGenerateStoryboard() {
    const current = await ensureAsset();
    if (!current) return;
    const payload = await generateContentStoryboard(current.id, { topic, audience, painPoint, cta });
    if (payload.scenes?.length) {
      setScenes(payload.scenes);
    }
    setFeedback(payload.usingFallback ? t("Using fallback storyboard scenes.") : t("Storyboard generated from root API."));
  }

  async function handleComplianceCheck() {
    const current = await ensureAsset();
    if (!current) return;
    const payload = await runContentComplianceReview(current.id, { forbidden });
    if (payload.asset) {
      setAsset(payload.asset);
    }
    setFeedback(payload.usingFallback ? t("Fallback compliance review queued.") : t("Compliance review requested."));
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("POV Video Generator")}</h1>
        <p className="mt-1 text-base text-eastaura-ink-muted">
          {t("Generate compliant POV scripts for Shanghai entry + Hangzhou wellness pilot campaigns")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,0.9fr)]">
        {/* Left Column - 2/3 */}
        <div className="space-y-6">
          {/* Input Form */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                <PenTool className="w-4 h-4 text-eastaura-forest" />
                {t("Video Brief")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BriefTextarea
                  label={t("Video Topic")}
                  placeholder="e.g. Shanghai arrival to Hangzhou reset"
                  value={topic}
                  onChange={setTopic}
                />
                <BriefTextarea
                  label={t("Target Audience")}
                  placeholder="e.g. US/EU professionals, 35-60"
                  value={audience}
                  onChange={setAudience}
                />
                <BriefTextarea
                  label={t("Core Pain Point")}
                  placeholder="e.g. A normal vacation does not reset sleep rhythm"
                  value={painPoint}
                  onChange={setPainPoint}
                />
                <BriefTextarea
                  label={t("CTA")}
                  placeholder="e.g. Start the pilot safety intake"
                  value={cta}
                  onChange={setCta}
                />
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Forbidden Phrases (comma-separated)")}</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. cure, heal, fix, treat, guaranteed"
                    value={forbidden}
                    onChange={(e) => setForbidden(e.target.value)}
                    className="w-full min-h-16 rounded-md border border-eastaura-warmgray bg-white px-3 py-2 text-sm text-eastaura-ink-light resize-none focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20 focus:border-eastaura-forest/30"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button className="bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-1.5" onClick={handleGenerateScript}>
                  <Wand2 className="w-4 h-4" /> {t("Generate Script")}
                </Button>
                <Button variant="outline" className="border-eastaura-warmgray gap-1.5" onClick={handleGenerateStoryboard}>
                  <Camera className="w-4 h-4" /> {t("Generate Shot Prompts")}
                </Button>
                <Button variant="outline" className="border-eastaura-warmgray gap-1.5" onClick={handleComplianceCheck}>
                  <ShieldAlert className="w-4 h-4" /> {t("Compliance Check")}
                </Button>
                <Button variant="outline" className="border-eastaura-warmgray gap-1.5" onClick={ensureAsset}>
                  <Save className="w-4 h-4" /> {t("Save Draft")}
                </Button>
              </div>
              {feedback && <div className="mt-3 rounded-md border border-eastaura-sage/35 bg-eastaura-sage-muted/40 px-3 py-2 text-xs text-eastaura-ink">{feedback}</div>}
            </CardContent>
          </Card>

          {/* AI Storyboard */}
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-eastaura-forest" />
                  {t("AI Storyboard Draft")}
                </CardTitle>
                <span className="text-xs text-eastaura-ink-muted">{t("5 scenes · 25 seconds · non-medical CTA")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenes.map((scene) => (
                  <div key={scene.number} className="flex gap-4 p-3 rounded-lg border border-eastaura-warmgray bg-eastaura-cream-dark">
                    <div className="w-24 h-16 rounded-md overflow-hidden bg-eastaura-warmgray shrink-0">
                      <Image
                        src={scene.thumbnail}
                        alt={scene.title}
                        width={96}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-eastaura-forest text-eastaura-cream text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {scene.number}
                        </span>
                        <span className="text-sm font-medium text-eastaura-ink">{scene.title}</span>
                        <span className="text-[10px] text-eastaura-ink-muted flex items-center gap-1 ml-auto shrink-0">
                          <Clock className="w-3 h-3" /> {scene.duration}
                        </span>
                      </div>
                      <p className="text-xs text-eastaura-ink-light leading-relaxed">{scene.caption}</p>
                      <p className="text-[10px] text-eastaura-ink-muted mt-1 italic">{scene.narration}</p>
                      {(scene.imagePrompt || scene.videoPrompt) && (
                        <p className="mt-1 text-[10px] text-eastaura-ink-muted">
                          {scene.imagePrompt && `Image: ${scene.imagePrompt}`} {scene.videoPrompt && `Video: ${scene.videoPrompt}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guidance Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-eastaura-gold-light/30 bg-eastaura-gold-muted">
            <Lightbulb className="w-4 h-4 text-eastaura-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-eastaura-ink">Focus on 20-40 second experience POV videos first.</p>
              <p className="text-xs text-eastaura-ink-muted mt-1">
                Use short POV clips to build trust first. Every script must pass medical-boundary review before publishing.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-5">
          <Card className="border-eastaura-warmgray shadow-card rounded-lg">
            <CardContent className="p-4">
              <AgentPanel
                title={t("Video Agent")}
                subtitle={t("Your video production assistant")}
                actions={[
                  { icon: Lightbulb, label: t("Generate 5 hooks") },
                  { icon: Scissors, label: t("Convert to 30-second version") },
                  { icon: FileOutput, label: t("Export shot prompts for creator brief") },
                  { icon: ShieldAlert, label: t("Check medical-claim risk") },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-eastaura-warmgray shadow-card rounded-lg bg-eastaura-forest text-eastaura-cream">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-eastaura-gold" />
                <span className="text-xs font-medium text-eastaura-gold">{t("Format Guide")}</span>
              </div>
              <div className="space-y-2 text-xs text-eastaura-cream/80">
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-eastaura-sage-light shrink-0" />
                  <span>Reels/TikTok/Shorts: 20-40s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-eastaura-sage-light shrink-0" />
                  <span>YouTube: 60s max</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-eastaura-sage-light shrink-0" />
                  <span>Hook in first 3 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-eastaura-sage-light shrink-0" />
                  <span>CTA points to Intake, never to medical advice</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BriefTextarea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{label}</label>
      <textarea
        rows={2}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-16 rounded-md border border-eastaura-warmgray bg-white px-3 py-2 text-sm text-eastaura-ink-light resize-none focus:outline-none focus:ring-1 focus:ring-eastaura-forest/20 focus:border-eastaura-forest/30"
      />
    </div>
  );
}

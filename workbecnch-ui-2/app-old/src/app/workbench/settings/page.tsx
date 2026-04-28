"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Webhook,
  Clock,
  Bot,
  FormInput,
  Shield,
  Bell,
  Save,
  Globe,
  Key,
  Database,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";

export default function Settings() {
  const { t } = useLanguage();
  const [dailyBriefTime, setDailyBriefTime] = useState("07:00");
  const [notificationEmail, setNotificationEmail] = useState("ops@eastaura.com");
  const [feishuWebhook, setFeishuWebhook] = useState("env: FEISHU_WEBHOOK_URL");
  const [aiProvider, setAiProvider] = useState("OpenAI Responses API via server-side Lead Triage Agent");
  const [apiKey, setApiKey] = useState("env: OPENAI_API_KEY");
  const [autoApprove, setAutoApprove] = useState(false);
  const [medicalReview, setMedicalReview] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [dataRetention, setDataRetention] = useState(365);

  return (
    <div className="w-full max-w-none space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-eastaura-ink">{t("Settings")}</h1>
        <p className="mt-1 text-base text-eastaura-ink-muted">
          {t("Configure the MVP operating assumptions, notifications, AI review, and Intake safety rules")}
        </p>
      </div>

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <User className="w-4 h-4 text-eastaura-forest" />
            {t("Admin Profile")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Image
              src="/workbench/avatars/founder.jpg"
            alt={t("Founder")}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Display Name")}</label>
                <Input defaultValue="Founder Operator" className="h-9 text-sm border-eastaura-warmgray" />
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Email")}</label>
                <Input defaultValue="ops@eastaura.com" className="h-9 text-sm border-eastaura-warmgray" />
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Timezone")}</label>
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-eastaura-warmgray bg-white text-sm text-eastaura-ink">
                  <Globe className="w-4 h-4 text-eastaura-ink-muted" />
                  Asia/Shanghai (GMT+8)
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Role")}</label>
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark text-sm text-eastaura-ink-muted">
                  Founder as trust owner — AI as operating system
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Bell className="w-4 h-4 text-eastaura-forest" />
            {t("Notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Notification Email")}</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
                <Input
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="h-9 text-sm border-eastaura-warmgray pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Daily Brief Time")}</label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
                <Input
                  type="time"
                  value={dailyBriefTime}
                  onChange={(e) => setDailyBriefTime(e.target.value)}
                  className="h-9 text-sm border-eastaura-warmgray pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Feishu Webhook URL")}</label>
            <div className="relative">
              <Webhook className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
              <Input
                value={feishuWebhook}
                onChange={(e) => setFeishuWebhook(e.target.value)}
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                className="h-9 text-sm border-eastaura-warmgray pl-9 font-mono"
              />
            </div>
            <p className="text-[11px] text-eastaura-ink-muted mt-1">For new lead, high-risk, daily brief, and failed notification alerts to Feishu/Lark</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Quiet Hours")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("Only urgent notifications 22:00 - 07:00")}</div>
            </div>
            <Switch checked={quietHours} onCheckedChange={setQuietHours} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Bot className="w-4 h-4 text-eastaura-forest" />
            {t("AI Provider")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Provider")}</label>
              <div className="relative">
                <Database className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
                <Input
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="h-9 text-sm border-eastaura-warmgray pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("API Key")}</label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-9 text-sm border-eastaura-warmgray pl-9 font-mono"
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-eastaura-ink-muted">
            {t("API keys stay server-side only. Browser UI displays env variable references, not secrets.")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <FormInput className="w-4 h-4 text-eastaura-forest" />
            {t("Intake Form Settings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Form URL")}</label>
              <Input defaultValue="/intake -> POST /api/intake -> Lead triage mock" className="h-9 text-sm border-eastaura-warmgray font-mono" readOnly />
            </div>
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">{t("Success Redirect")}</label>
              <Input defaultValue="/thank-you + human review within 1-2 business days" className="h-9 text-sm border-eastaura-warmgray" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Auto-generate AI summary")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("Create lead summary immediately after form submission")}</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Auto-score intent")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("Automatically score lead intent on submission")}</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Shield className="w-4 h-4 text-eastaura-forest" />
            {t("Privacy & Safety")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Require medical review for flagged leads")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("AI-flagged medical conditions require manual approval")}</div>
            </div>
            <Switch checked={medicalReview} onCheckedChange={setMedicalReview} />
          </div>
          <div className="flex items-center justify-between py-1 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Auto-approve low-risk tasks")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("Automatically approve routine, low-risk AI recommendations")}</div>
            </div>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </div>
          <div className="flex items-center justify-between py-1 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">{t("Data retention (days)")}</div>
              <div className="text-xs text-eastaura-ink-muted">{t("Pilot default; replace with privacy policy after legal review")}</div>
            </div>
            <Input
              type="number"
              value={dataRetention}
              onChange={(e) => setDataRetention(Number(e.target.value))}
              className="h-8 w-24 text-sm border-eastaura-warmgray text-right"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-2">
          <Save className="w-4 h-4" /> {t("Save All Settings")}
        </Button>
      </div>
    </div>
  );
}

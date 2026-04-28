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

export default function Settings() {
  const [dailyBriefTime, setDailyBriefTime] = useState("07:00");
  const [notificationEmail, setNotificationEmail] = useState("founder@eastaura.com");
  const [feishuWebhook, setFeishuWebhook] = useState("https://open.feishu.cn/open-apis/bot/v2/hook/...");
  const [aiProvider, setAiProvider] = useState("OpenAI GPT-4o");
  const [apiKey, setApiKey] = useState("sk-•••••••••••••••••••••••••");
  const [autoApprove, setAutoApprove] = useState(false);
  const [medicalReview, setMedicalReview] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [dataRetention, setDataRetention] = useState(365);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-eastaura-ink">Settings</h1>
        <p className="text-sm text-eastaura-ink-muted mt-0.5">
          Configure your workbench preferences and integrations
        </p>
      </div>

      {/* Profile */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <User className="w-4 h-4 text-eastaura-forest" />
            Admin Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-eastaura-forest flex items-center justify-center text-eastaura-cream text-lg font-medium shrink-0">
              F
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Display Name</label>
                <Input defaultValue="Founder" className="h-9 text-sm border-eastaura-warmgray" />
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Email</label>
                <Input defaultValue="founder@eastaura.com" className="h-9 text-sm border-eastaura-warmgray" />
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Timezone</label>
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-eastaura-warmgray bg-white text-sm text-eastaura-ink">
                  <Globe className="w-4 h-4 text-eastaura-ink-muted" />
                  Asia/Shanghai (GMT+8)
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Role</label>
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark text-sm text-eastaura-ink-muted">
                  Solo Founder — Full Access
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Bell className="w-4 h-4 text-eastaura-forest" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Notification Email</label>
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
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Daily Brief Time</label>
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
            <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Feishu Webhook URL</label>
            <div className="relative">
              <Webhook className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
              <Input
                value={feishuWebhook}
                onChange={(e) => setFeishuWebhook(e.target.value)}
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                className="h-9 text-sm border-eastaura-warmgray pl-9 font-mono"
              />
            </div>
            <p className="text-[11px] text-eastaura-ink-muted mt-1">For urgent alerts and daily brief delivery to Feishu/Lark</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Quiet Hours</div>
              <div className="text-xs text-eastaura-ink-muted">Only urgent notifications 22:00 - 07:00</div>
            </div>
            <Switch checked={quietHours} onCheckedChange={setQuietHours} />
          </div>
        </CardContent>
      </Card>

      {/* AI Provider */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Bot className="w-4 h-4 text-eastaura-forest" />
            AI Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Provider</label>
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
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">API Key</label>
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
            API key is stored locally and never sent to the browser. Connect to OpenAI, Anthropic, or your preferred provider.
          </p>
        </CardContent>
      </Card>

      {/* Intake Form Settings */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <FormInput className="w-4 h-4 text-eastaura-forest" />
            Intake Form Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Form URL</label>
              <Input defaultValue="https://eastaura.com/intake" className="h-9 text-sm border-eastaura-warmgray font-mono" readOnly />
            </div>
            <div>
              <label className="text-xs font-medium text-eastaura-ink-muted mb-1.5 block">Success Redirect</label>
              <Input defaultValue="https://eastaura.com/thank-you" className="h-9 text-sm border-eastaura-warmgray" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Auto-generate AI summary</div>
              <div className="text-xs text-eastaura-ink-muted">Create lead summary immediately after form submission</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Auto-score intent</div>
              <div className="text-xs text-eastaura-ink-muted">Automatically score lead intent on submission</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Safety */}
      <Card className="border-eastaura-warmgray shadow-card rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-eastaura-ink flex items-center gap-2">
            <Shield className="w-4 h-4 text-eastaura-forest" />
            Privacy & Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Require medical review for flagged leads</div>
              <div className="text-xs text-eastaura-ink-muted">AI-flagged medical conditions require manual approval</div>
            </div>
            <Switch checked={medicalReview} onCheckedChange={setMedicalReview} />
          </div>
          <div className="flex items-center justify-between py-1 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Auto-approve low-risk tasks</div>
              <div className="text-xs text-eastaura-ink-muted">Automatically approve routine, low-risk AI recommendations</div>
            </div>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </div>
          <div className="flex items-center justify-between py-1 border-t border-eastaura-warmgray/50">
            <div>
              <div className="text-sm font-medium text-eastaura-ink">Data retention (days)</div>
              <div className="text-xs text-eastaura-ink-muted">Auto-delete archived leads after this period</div>
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

      {/* Save */}
      <div className="flex justify-end">
        <Button className="bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream gap-2">
          <Save className="w-4 h-4" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}

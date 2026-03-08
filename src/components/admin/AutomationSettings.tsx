import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Webhook, Save, TestTube, Trash2 } from "lucide-react";

interface WebhookConfig {
  name: string;
  url: string;
  enabled: boolean;
}

const SETTING_KEY = "automation_webhooks";

const AutomationSettings = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
    if (data?.value) {
      try {
        setWebhooks(JSON.parse(data.value));
      } catch { /* empty */ }
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: SETTING_KEY, value: JSON.stringify(webhooks) }, { onConflict: "key" });
    if (error) toast.error(error.message);
    else toast.success("Automation settings saved!");
    setSaving(false);
  };

  const addWebhook = () => {
    setWebhooks([...webhooks, { name: "", url: "", enabled: true }]);
  };

  const updateWebhook = (index: number, field: keyof WebhookConfig, value: string | boolean) => {
    const updated = [...webhooks];
    (updated[index] as any)[field] = value;
    setWebhooks(updated);
  };

  const removeWebhook = (index: number) => {
    setWebhooks(webhooks.filter((_, i) => i !== index));
  };

  const testWebhook = async (index: number) => {
    const wh = webhooks[index];
    if (!wh.url) {
      toast.error("Enter a webhook URL first");
      return;
    }
    setTesting(index);
    try {
      await fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          source: "librora-daily-report",
          timestamp: new Date().toISOString(),
          message: "Test webhook from Librora Admin",
        }),
      });
      toast.success(`Test sent to "${wh.name || "Unnamed"}". Check your automation tool to verify.`);
    } catch {
      toast.error("Failed to send test webhook");
    }
    setTesting(null);
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Automation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure webhooks to send daily report data to n8n, Zapier, Make, or any automation tool.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Preset hints */}
      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Setup Guides</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium text-foreground mb-1">🔧 n8n</p>
            <p className="text-xs text-muted-foreground">Create a Webhook trigger node → Copy the Production URL → Paste below</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium text-foreground mb-1">⚡ Zapier</p>
            <p className="text-xs text-muted-foreground">Create a Zap → Add "Webhooks by Zapier" trigger → Copy the webhook URL → Paste below</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium text-foreground mb-1">🔗 Make</p>
            <p className="text-xs text-muted-foreground">Create a scenario → Add Custom Webhook module → Copy URL → Paste below</p>
          </div>
        </div>
      </div>

      {/* Webhook list */}
      <div className="space-y-4">
        {webhooks.map((wh, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <Webhook className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input
                      type="text"
                      value={wh.name}
                      onChange={(e) => updateWebhook(i, "name", e.target.value)}
                      placeholder="e.g. n8n Daily Report, Zapier Email"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <button
                      onClick={() => updateWebhook(i, "enabled", !wh.enabled)}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                        wh.enabled
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {wh.enabled ? "● Enabled" : "○ Disabled"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Webhook URL</label>
                  <input
                    type="url"
                    value={wh.url}
                    onChange={(e) => updateWebhook(i, "url", e.target.value)}
                    placeholder="https://your-automation-tool.com/webhook/..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => testWebhook(i)}
                    disabled={testing === i}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <TestTube className="h-3.5 w-3.5" />
                    {testing === i ? "Sending..." : "Test"}
                  </button>
                  <button
                    onClick={() => removeWebhook(i)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addWebhook}
          className="w-full rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
        >
          + Add Webhook
        </button>
      </div>
    </>
  );
};

export default AutomationSettings;

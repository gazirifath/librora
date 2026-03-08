import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsGeneral = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [siteTitle, setSiteTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [dailyReportEmail, setDailyReportEmail] = useState("");

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title || "");
      setTagline(settings.tagline || "");
      setSiteUrl(settings.site_url || "");
      setAdminEmail(settings.admin_email || "");
      setDailyReportEmail(settings.daily_report_email || "");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ site_title: siteTitle, tagline, site_url: siteUrl, admin_email: adminEmail, daily_report_email: dailyReportEmail });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">General Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Site Title</label>
          <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Tagline</label>
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Site URL</label>
          <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Admin Email</label>
          <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Daily Report Email</label>
          <p className="text-xs text-muted-foreground mb-1">Collected emails will be sent daily to this address.</p>
          <input type="email" value={dailyReportEmail} onChange={e => setDailyReportEmail(e.target.value)} placeholder="report@example.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsGeneral;

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsPrivacy = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [privacyPage, setPrivacyPage] = useState("privacy");
  const [cookieConsent, setCookieConsent] = useState(true);

  useEffect(() => {
    if (settings) {
      setPrivacyPage(settings.privacy_page || "privacy");
      setCookieConsent(settings.cookie_consent !== "false");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ privacy_page: privacyPage, cookie_consent: String(cookieConsent) });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Privacy Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Privacy Policy Page</label>
          <select value={privacyPage} onChange={e => setPrivacyPage(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="privacy">Privacy Policy</option>
            <option value="">— Select —</option>
          </select>
        </div>
        <p className="text-sm text-muted-foreground">
          As a website owner, you may need to follow national or international privacy laws.
          Select your privacy policy page above and it will be linked from your site.
        </p>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={cookieConsent} onChange={e => setCookieConsent(e.target.checked)} className="rounded border-input" />
          Show cookie consent banner
        </label>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsPrivacy;

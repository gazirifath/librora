import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsPermalinks = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [structure, setStructure] = useState("post-name");

  useEffect(() => {
    if (settings) setStructure(settings.permalink_structure || "post-name");
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ permalink_structure: structure });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  const options = [
    { label: "Plain", value: "plain", example: "/?p=123" },
    { label: "Day and name", value: "day-name", example: "/2026/03/08/sample-post/" },
    { label: "Month and name", value: "month-name", example: "/2026/03/sample-post/" },
    { label: "Numeric", value: "numeric", example: "/archives/123" },
    { label: "Post name", value: "post-name", example: "/sample-post/" },
  ];

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Permalink Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <p className="text-sm text-muted-foreground">Select the permalink structure for your site.</p>
        <div className="space-y-3">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-3 text-sm text-foreground">
              <input type="radio" name="permalink" value={opt.value} checked={structure === opt.value} onChange={e => setStructure(e.target.value)} />
              <span className="font-medium w-32">{opt.label}</span>
              <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{opt.example}</code>
            </label>
          ))}
        </div>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsPermalinks;

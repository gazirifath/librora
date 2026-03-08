import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsMedia = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [thumbW, setThumbW] = useState("150");
  const [thumbH, setThumbH] = useState("150");
  const [medW, setMedW] = useState("300");
  const [medH, setMedH] = useState("300");

  useEffect(() => {
    if (settings) {
      setThumbW(settings.thumb_width || "150");
      setThumbH(settings.thumb_height || "150");
      setMedW(settings.medium_width || "300");
      setMedH(settings.medium_height || "300");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ thumb_width: thumbW, thumb_height: thumbH, medium_width: medW, medium_height: medH });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Media Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <h2 className="font-heading font-bold text-foreground">Image Sizes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Thumbnail size</label>
            <div className="flex items-center gap-2">
              <input type="number" value={thumbW} onChange={e => setThumbW(e.target.value)} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <span className="text-sm text-muted-foreground">×</span>
              <input type="number" value={thumbH} onChange={e => setThumbH(e.target.value)} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Medium size</label>
            <div className="flex items-center gap-2">
              <input type="number" value={medW} onChange={e => setMedW(e.target.value)} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <span className="text-sm text-muted-foreground">×</span>
              <input type="number" value={medH} onChange={e => setMedH(e.target.value)} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsMedia;

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings, useCategories } from "@/hooks/useAdminData";

const SettingsWriting = () => {
  const { data: settings, isLoading } = useSettings();
  const { data: categories } = useCategories();
  const updateSettings = useUpdateSettings();
  const [defaultCategory, setDefaultCategory] = useState("");
  const [defaultFormat, setDefaultFormat] = useState("standard");

  useEffect(() => {
    if (settings) {
      setDefaultCategory(settings.default_category || "");
      setDefaultFormat(settings.default_format || "standard");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ default_category: defaultCategory, default_format: defaultFormat });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Writing Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Default Post Category</label>
          <select value={defaultCategory} onChange={e => setDefaultCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {categories?.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Default Post Format</label>
          <select value={defaultFormat} onChange={e => setDefaultFormat(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="standard">Standard</option><option value="summary">Summary</option><option value="review">Review</option>
          </select>
        </div>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsWriting;

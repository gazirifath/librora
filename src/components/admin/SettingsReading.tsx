import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsReading = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [homepageDisplay, setHomepageDisplay] = useState("latest");
  const [postsPerPage, setPostsPerPage] = useState("10");

  useEffect(() => {
    if (settings) {
      setHomepageDisplay(settings.homepage_display || "latest");
      setPostsPerPage(settings.posts_per_page || "10");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ homepage_display: homepageDisplay, posts_per_page: postsPerPage });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Reading Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Homepage displays</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="radio" name="homepage" value="latest" checked={homepageDisplay === "latest"} onChange={e => setHomepageDisplay(e.target.value)} /> Latest posts
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="radio" name="homepage" value="static" checked={homepageDisplay === "static"} onChange={e => setHomepageDisplay(e.target.value)} /> A static page
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Posts per page</label>
          <input type="number" value={postsPerPage} onChange={e => setPostsPerPage(e.target.value)}
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={updateSettings.isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </>
  );
};
export default SettingsReading;

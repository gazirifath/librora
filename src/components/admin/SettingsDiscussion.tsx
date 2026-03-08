import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

const SettingsDiscussion = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [allowComments, setAllowComments] = useState(true);
  const [requireNameEmail, setRequireNameEmail] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [moderation, setModeration] = useState("hold");

  useEffect(() => {
    if (settings) {
      setAllowComments(settings.allow_comments !== "false");
      setRequireNameEmail(settings.require_name_email !== "false");
      setRequireLogin(settings.require_login === "true");
      setModeration(settings.comment_moderation || "hold");
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      allow_comments: String(allowComments),
      require_name_email: String(requireNameEmail),
      require_login: String(requireLogin),
      comment_moderation: moderation,
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Discussion Settings</h1>
      <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={allowComments} onChange={e => setAllowComments(e.target.checked)} className="rounded border-input" />
          Allow people to submit comments on new posts
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={requireNameEmail} onChange={e => setRequireNameEmail(e.target.checked)} className="rounded border-input" />
          Comment author must fill out name and email
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={requireLogin} onChange={e => setRequireLogin(e.target.checked)} className="rounded border-input" />
          Users must be registered and logged in to comment
        </label>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Comment moderation</label>
          <select value={moderation} onChange={e => setModeration(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="hold">Hold for moderation</option>
            <option value="auto">Auto-approve</option>
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
export default SettingsDiscussion;

const SettingsDiscussion = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Discussion Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" defaultChecked className="rounded border-input" />
          Allow people to submit comments on new posts
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" defaultChecked className="rounded border-input" />
          Comment author must fill out name and email
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" className="rounded border-input" />
          Users must be registered and logged in to comment
        </label>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Comment moderation</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Hold for moderation</option>
          <option>Auto-approve</option>
        </select>
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsDiscussion;

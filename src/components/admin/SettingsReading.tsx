const SettingsReading = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Reading Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Homepage displays</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="homepage" defaultChecked /> Latest posts
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="homepage" /> A static page
          </label>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Posts per page</label>
        <input type="number" defaultValue={10} className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsReading;

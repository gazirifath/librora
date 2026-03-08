const SettingsPrivacy = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Privacy Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Privacy Policy Page</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Privacy Policy</option>
          <option>— Select —</option>
        </select>
      </div>
      <p className="text-sm text-muted-foreground">
        As a website owner, you may need to follow national or international privacy laws. 
        Select your privacy policy page above and it will be linked from your site.
      </p>
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" defaultChecked className="rounded border-input" />
          Show cookie consent banner
        </label>
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsPrivacy;

const SettingsGeneral = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">General Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Site Title</label>
        <input type="text" defaultValue="Librora" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Tagline</label>
        <input type="text" defaultValue="Free Book Summaries" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Site URL</label>
        <input type="url" placeholder="https://yourdomain.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Admin Email</label>
        <input type="email" defaultValue="rifath.swe@gmail.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsGeneral;

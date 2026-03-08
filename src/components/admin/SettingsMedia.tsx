const SettingsMedia = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Media Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <h2 className="font-heading font-bold text-foreground">Image Sizes</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Thumbnail size</label>
          <div className="flex items-center gap-2">
            <input type="number" defaultValue={150} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <span className="text-sm text-muted-foreground">×</span>
            <input type="number" defaultValue={150} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Medium size</label>
          <div className="flex items-center gap-2">
            <input type="number" defaultValue={300} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <span className="text-sm text-muted-foreground">×</span>
            <input type="number" defaultValue={300} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsMedia;

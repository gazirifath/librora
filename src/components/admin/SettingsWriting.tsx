const SettingsWriting = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Writing Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Default Post Category</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Self-Help</option><option>Business</option><option>Psychology</option>
          <option>Productivity</option><option>Finance</option><option>Leadership</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Default Post Format</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Standard</option><option>Summary</option><option>Review</option>
        </select>
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsWriting;

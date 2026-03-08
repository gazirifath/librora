const SettingsPermalinks = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Permalink Settings</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-2xl">
      <p className="text-sm text-muted-foreground">Select the permalink structure for your site.</p>
      <div className="space-y-3">
        {[
          { label: "Plain", value: "/?p=123" },
          { label: "Day and name", value: "/2026/03/08/sample-post/" },
          { label: "Month and name", value: "/2026/03/sample-post/" },
          { label: "Numeric", value: "/archives/123" },
          { label: "Post name", value: "/sample-post/", default: true },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-3 text-sm text-foreground">
            <input type="radio" name="permalink" defaultChecked={opt.default} />
            <span className="font-medium w-32">{opt.label}</span>
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{opt.value}</code>
          </label>
        ))}
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Save Changes
      </button>
    </div>
  </>
);
export default SettingsPermalinks;

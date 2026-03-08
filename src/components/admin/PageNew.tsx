const PageNew = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Add New Page</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Page Title</label>
        <input type="text" placeholder="Enter page title" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Content</label>
        <textarea rows={10} placeholder="Write page content..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Slug</label>
        <input type="text" placeholder="/page-slug" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Publish
      </button>
    </div>
  </>
);
export default PageNew;

const PostTags = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Tags</h1>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-foreground">Add New Tag</h2>
        <input type="text" placeholder="Tag name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input type="text" placeholder="Slug" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <textarea rows={3} placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Add Tag
        </button>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">No tags created yet.</p>
      </div>
    </div>
  </>
);
export default PostTags;

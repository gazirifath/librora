const PostNew = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Add New Post</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Title</label>
        <input type="text" placeholder="Enter post title" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Author</label>
        <input type="text" placeholder="Author name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Category</label>
        <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Self-Help</option><option>Business</option><option>Psychology</option>
          <option>Productivity</option><option>Finance</option><option>Leadership</option>
          <option>Health</option><option>Philosophy</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Summary</label>
        <textarea rows={6} placeholder="Write book summary..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Download Link</label>
        <input type="url" placeholder="https://..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Publish
      </button>
    </div>
  </>
);
export default PostNew;

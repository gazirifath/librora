const Media = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Media Library</h1>
    <div className="rounded-lg border border-border bg-card p-10 text-center">
      <p className="text-muted-foreground mb-2">No media files uploaded yet.</p>
      <a href="/admin/media/new" className="text-sm text-primary hover:underline">Upload your first file</a>
    </div>
  </>
);
export default Media;

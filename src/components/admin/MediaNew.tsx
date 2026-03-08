import { Upload } from "lucide-react";

const MediaNew = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Add Media File</h1>
    <div className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">Drop files here or click to upload</p>
      <p className="text-xs text-muted-foreground mb-4">Maximum upload file size: 20 MB</p>
      <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
        <Upload className="h-4 w-4" /> Select Files
        <input type="file" multiple className="hidden" />
      </label>
    </div>
  </>
);
export default MediaNew;

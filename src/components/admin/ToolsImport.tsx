import { Upload } from "lucide-react";

const ToolsImport = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Import</h1>
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground mb-4">Import content from a CSV or JSON file.</p>
      <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
        <Upload className="h-4 w-4" /> Choose File
        <input type="file" accept=".csv,.json" className="hidden" />
      </label>
    </div>
  </>
);
export default ToolsImport;

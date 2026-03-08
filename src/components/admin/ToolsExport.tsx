import { Download } from "lucide-react";

const ToolsExport = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Export</h1>
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <p className="text-sm text-muted-foreground">Export your site content as CSV or JSON.</p>
      <div className="flex gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Download className="h-4 w-4" /> Export JSON
        </button>
      </div>
    </div>
  </>
);
export default ToolsExport;

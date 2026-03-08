import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const Pages = () => (
  <>
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">All Pages</h1>
      <Link to="/admin/pages/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <PlusCircle className="h-4 w-4" /> Add New
      </Link>
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {["Home", "Privacy Policy", "Terms", "Affiliate Disclosure", "DMCA"].map(page => (
            <tr key={page} className="border-b border-border last:border-0 hover:bg-muted/50">
              <td className="px-4 py-3 font-medium text-primary">{page}</td>
              <td className="px-4 py-3">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
export default Pages;

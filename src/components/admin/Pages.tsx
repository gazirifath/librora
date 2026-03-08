import { usePages, useDeletePage, useUpdatePage } from "@/hooks/useAdminData";
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

const Pages = () => {
  const { data: pages, isLoading } = usePages();
  const deletePage = useDeletePage();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">All Pages</h1>
        <Link to="/admin/pages/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <PlusCircle className="h-4 w-4" /> Add New
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages?.map((page: any) => (
                <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-primary">
                    <Link to={`/admin/pages/edit/${page.id}`}>{page.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${page.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(page.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/admin/pages/edit/${page.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button onClick={() => { if (confirm("Delete this page?")) deletePage.mutate(page.id); }} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
export default Pages;

import { useState } from "react";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useAdminData";
import { Trash2 } from "lucide-react";

const PostCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(
      { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), description },
      { onSuccess: () => { setName(""); setSlug(""); setDescription(""); } }
    );
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Categories</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">Add New Category</h2>
          <input type="text" value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
            placeholder="Category name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
            placeholder="Slug" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={createCategory.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            Add Category
          </button>
        </form>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isLoading ? <div className="p-4 text-muted-foreground">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((cat: any) => (
                  <tr key={cat.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (confirm("Delete?")) deleteCategory.mutate(cat.id); }} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};
export default PostCategories;

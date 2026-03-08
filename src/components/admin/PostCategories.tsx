import { categories } from "@/data/books";

const PostCategories = () => (
  <>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Categories</h1>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-foreground">Add New Category</h2>
        <input type="text" placeholder="Category name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input type="text" placeholder="Slug" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <textarea rows={3} placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Add Category
        </button>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Count</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-primary">{cat}</td>
                <td className="px-4 py-3 text-muted-foreground">{cat.toLowerCase().replace(/\s+/g, "-")}</td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);
export default PostCategories;

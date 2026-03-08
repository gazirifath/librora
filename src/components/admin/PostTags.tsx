import { useState } from "react";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/useAdminData";
import { Trash2 } from "lucide-react";

const PostTags = () => {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTag.mutate(
      { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), description },
      { onSuccess: () => { setName(""); setSlug(""); setDescription(""); } }
    );
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Tags</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">Add New Tag</h2>
          <input type="text" value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
            placeholder="Tag name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
            placeholder="Slug" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={createTag.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            Add Tag
          </button>
        </form>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isLoading ? <div className="p-4 text-muted-foreground">Loading...</div> : !tags?.length ? (
            <div className="p-6 text-sm text-muted-foreground">No tags created yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag: any) => (
                  <tr key={tag.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{tag.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (confirm("Delete?")) deleteTag.mutate(tag.id); }} className="text-muted-foreground hover:text-destructive">
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
export default PostTags;

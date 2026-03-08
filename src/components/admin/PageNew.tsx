import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreatePage, useUpdatePage } from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "./RichTextEditor";

const PageNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existingPage } = useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const createPage = useCreatePage();
  const updatePage = useUpdatePage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [loaded, setLoaded] = useState(false);

  if (isEdit && existingPage && !loaded) {
    setTitle(existingPage.title);
    setSlug(existingPage.slug);
    setContent(existingPage.content || "");
    setStatus(existingPage.status);
    setLoaded(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      content,
      status,
    };
    if (isEdit) {
      updatePage.mutate({ id: id!, ...data }, { onSuccess: () => navigate("/admin/pages") });
    } else {
      createPage.mutate(data, { onSuccess: () => navigate("/admin/pages") });
    }
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
        {isEdit ? "Edit Page" : "Add New Page"}
      </h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-3xl">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Page Title *</label>
          <input type="text" value={title} onChange={e => { setTitle(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
            required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Slug</label>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Content</label>
          <textarea rows={12} value={content} onChange={e => setContent(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-4">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button type="submit" disabled={createPage.isPending || updatePage.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </form>
    </>
  );
};
export default PageNew;

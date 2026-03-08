import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories, useCreatePost, useUpdatePost, usePost } from "@/hooks/useAdminData";

const PostNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: existingPost } = usePost(id || "");
  const { data: categories } = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [summary, setSummary] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [readingTime, setReadingTime] = useState("5 min");
  const [keyLessons, setKeyLessons] = useState("");
  const [status, setStatus] = useState("draft");
  const [loaded, setLoaded] = useState(false);

  if (isEdit && existingPost && !loaded) {
    setTitle(existingPost.title);
    setSlug(existingPost.slug);
    setAuthor(existingPost.author || "");
    setCategoryId(existingPost.category_id || "");
    setSummary(existingPost.summary || "");
    setDownloadUrl(existingPost.download_url || "");
    setAffiliateUrl(existingPost.affiliate_url || "");
    setReadingTime(existingPost.reading_time || "5 min");
    setKeyLessons((existingPost.key_lessons || []).join("\n"));
    setStatus(existingPost.status);
    setLoaded(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      author,
      category_id: categoryId || null,
      summary,
      download_url: downloadUrl,
      affiliate_url: affiliateUrl,
      reading_time: readingTime,
      key_lessons: keyLessons.split("\n").filter(Boolean),
      status,
    };

    if (isEdit) {
      updatePost.mutate({ id: id!, ...data }, { onSuccess: () => navigate("/admin/posts") });
    } else {
      createPost.mutate(data, { onSuccess: () => navigate("/admin/posts") });
    }
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
        {isEdit ? "Edit Post" : "Add New Post"}
      </h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Title *</label>
            <input type="text" value={title} onChange={e => { setTitle(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
              required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Author</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">— Select —</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Summary</label>
          <textarea rows={8} value={summary} onChange={e => setSummary(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Key Lessons (one per line)</label>
          <textarea rows={4} value={keyLessons} onChange={e => setKeyLessons(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Download Link</label>
            <input type="url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Affiliate Link</label>
            <input type="url" value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Reading Time</label>
            <input type="text" value={readingTime} onChange={e => setReadingTime(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button type="submit" disabled={createPost.isPending || updatePost.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </form>
    </>
  );
};
export default PostNew;

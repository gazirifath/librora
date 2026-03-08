import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories, useCreatePost, useUpdatePost, usePost } from "@/hooks/useAdminData";
import { PlusCircle, Trash2 } from "lucide-react";

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
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>([]);
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
    setFaq(Array.isArray(existingPost.faq) ? existingPost.faq as { question: string; answer: string }[] : []);
    setStatus(existingPost.status);
    setLoaded(true);
  }

  const addFaq = () => setFaq([...faq, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaq(faq.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: "question" | "answer", value: string) => {
    const updated = [...faq];
    updated[i] = { ...updated[i], [field]: value };
    setFaq(updated);
  };

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
      faq: faq.filter(f => f.question.trim()),
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

        {/* FAQ Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">FAQ</label>
            <button type="button" onClick={addFaq}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <PlusCircle className="h-3.5 w-3.5" /> Add Question
            </button>
          </div>
          {faq.length === 0 ? (
            <p className="text-xs text-muted-foreground">No FAQ items. Click "Add Question" to start.</p>
          ) : (
            <div className="space-y-3">
              {faq.map((item, i) => (
                <div key={i} className="rounded-md border border-input bg-background p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input type="text" value={item.question} onChange={e => updateFaq(i, "question", e.target.value)}
                        placeholder="Question" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    </div>
                    <button type="button" onClick={() => removeFaq(i)} className="text-muted-foreground hover:text-destructive mt-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea rows={2} value={item.answer} onChange={e => updateFaq(i, "answer", e.target.value)}
                    placeholder="Answer" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          )}
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

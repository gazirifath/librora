import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Copy, Trash2, ExternalLink, BookOpen } from "lucide-react";

const MediaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Find books using this image
  const { data: linkedBooks } = useQuery({
    queryKey: ["media-books", media?.url],
    queryFn: async () => {
      if (!media?.url) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, cover_url")
        .eq("cover_url", media.url);
      if (error) throw error;
      return data || [];
    },
    enabled: !!media?.url,
  });

  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (media && !loaded) {
      setAltText((media as any).alt_text || "");
      setTitle((media as any).title || "");
      setCaption((media as any).caption || "");
      setDescription((media as any).description || "");
      setLoaded(true);
    }
  }, [media, loaded]);

  const updateMedia = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("media")
        .update({ alt_text: altText, title, caption, description } as any)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media details updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMedia = useMutation({
    mutationFn: async () => {
      if (media?.filename) {
        await supabase.storage.from("media").remove([media.filename]);
      }
      const { error } = await supabase.from("media").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("File deleted");
      navigate("/admin/media");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyUrl = () => {
    if (media?.url) {
      navigator.clipboard.writeText(media.url);
      toast.success("URL copied to clipboard");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!media) {
    return <div className="text-muted-foreground">Media not found.</div>;
  }

  const isImage = media.file_type?.startsWith("image");

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/media" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">Edit Media</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Preview */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isImage ? (
            <img src={media.url} alt={altText || media.filename} className="w-full object-contain max-h-[500px] bg-muted/20" />
          ) : (
            <div className="w-full h-64 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-lg">{media.file_type || "File"}</span>
            </div>
          )}
        </div>

        {/* Details & Edit form */}
        <div className="space-y-5">
          {/* File info */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wide">File Details</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Filename:</span>
              <span className="text-foreground truncate">{media.filename}</span>
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground">{media.file_type || "Unknown"}</span>
              <span className="text-muted-foreground">Size:</span>
              <span className="text-foreground">{formatFileSize(media.file_size)}</span>
              <span className="text-muted-foreground">Uploaded:</span>
              <span className="text-foreground">{new Date(media.uploaded_at).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={copyUrl}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                <Copy className="h-3.5 w-3.5" /> Copy URL
              </button>
              <a href={media.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> View Original
              </a>
            </div>
          </div>

          {/* Edit metadata */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wide">Metadata</h2>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Alternative Text</label>
              <input type="text" value={altText} onChange={e => setAltText(e.target.value)}
                placeholder="Describe this image for accessibility"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Image title"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Caption</label>
              <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Caption displayed with the image"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={() => updateMedia.mutate()} disabled={updateMedia.isPending}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {updateMedia.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Linked books */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Used By Books
            </h2>
            {!linkedBooks?.length ? (
              <p className="text-xs text-muted-foreground">This image is not used as a cover for any book.</p>
            ) : (
              <ul className="space-y-2">
                {linkedBooks.map((book: any) => (
                  <li key={book.id}>
                    <Link to={`/admin/posts/edit/${book.id}`}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{book.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => { if (confirm("Are you sure you want to permanently delete this file?")) deleteMedia.mutate(); }}
            disabled={deleteMedia.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
            <Trash2 className="h-4 w-4" />
            {deleteMedia.isPending ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </>
  );
};

export default MediaEdit;
import { useState } from "react";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MediaNew = () => {
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const filename = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(filename, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filename);

        const { error: dbError } = await supabase.from("media").insert({
          filename,
          url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        });
        if (dbError) throw dbError;
      }
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success(`${files.length} file(s) uploaded`);
      navigate("/admin/media");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Add Media File</h1>
      <div
        className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium mb-1">
          {uploading ? "Uploading..." : "Drop files here or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground mb-4">Maximum upload file size: 20 MB</p>
        <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
          <Upload className="h-4 w-4" /> Select Files
          <input type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
        </label>
      </div>
    </>
  );
};
export default MediaNew;

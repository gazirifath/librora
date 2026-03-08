import { useMedia, useDeleteMedia } from "@/hooks/useAdminData";
import { Link } from "react-router-dom";
import { PlusCircle, Trash2, Image } from "lucide-react";

const Media = () => {
  const { data: media, isLoading } = useMedia();
  const deleteMedia = useDeleteMedia();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Media Library</h1>
        <Link to="/admin/media/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <PlusCircle className="h-4 w-4" /> Add New
        </Link>
      </div>
      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !media?.length ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Image className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-2">No media files uploaded yet.</p>
          <Link to="/admin/media/new" className="text-sm text-primary hover:underline">Upload your first file</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((file: any) => (
            <div key={file.id} className="rounded-lg border border-border bg-card overflow-hidden group relative">
              {file.file_type?.startsWith("image") ? (
                <img src={file.url} alt={file.filename} className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{file.file_type}</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-foreground truncate">{file.filename}</p>
              </div>
              <button
                onClick={() => { if (confirm("Delete?")) deleteMedia.mutate({ id: file.id, filename: file.filename }); }}
                className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
export default Media;

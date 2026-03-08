import { usePosts, useDeletePost } from "@/hooks/useAdminData";
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

const Posts = () => {
  const { data: posts, isLoading } = usePosts();
  const deletePost = useDeletePost();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">All Posts</h1>
        <Link to="/admin/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <PlusCircle className="h-4 w-4" /> Add New
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : !posts?.length ? (
          <div className="p-8 text-center text-muted-foreground">No posts yet. <Link to="/admin/posts/new" className="text-primary hover:underline">Create one</Link></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any) => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-primary">
                    <Link to={`/admin/posts/edit/${post.id}`}>{post.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">{post.author}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {post.categories?.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/admin/posts/edit/${post.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button onClick={() => { if (confirm("Delete this post?")) deletePost.mutate(post.id); }} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
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

export default Posts;

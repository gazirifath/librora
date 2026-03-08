import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Mail, Download, Trophy } from "lucide-react";
import { toast } from "sonner";

interface BookStat {
  id: string;
  title: string;
  author: string;
  download_count: number;
  email_count: number;
  category_name: string | null;
}

const Analytics = () => {
  const [books, setBooks] = useState<BookStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch posts with download counts
      const { data: posts, error: postsErr } = await supabase
        .from("posts")
        .select("id, title, author, download_count, categories(name)")
        .order("download_count", { ascending: false });
      if (postsErr) throw postsErr;

      // Fetch email counts per post
      const { data: emailCounts, error: emailErr } = await supabase
        .from("collected_emails")
        .select("post_id");
      if (emailErr) throw emailErr;

      const emailMap = new Map<string, number>();
      emailCounts?.forEach((e: any) => {
        if (e.post_id) emailMap.set(e.post_id, (emailMap.get(e.post_id) || 0) + 1);
      });

      const stats: BookStat[] = (posts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        author: p.author,
        download_count: p.download_count || 0,
        email_count: emailMap.get(p.id) || 0,
        category_name: p.categories?.name || null,
      }));

      setBooks(stats);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const byDownloads = [...books].sort((a, b) => b.download_count - a.download_count);
  const byEmails = [...books].sort((a, b) => b.email_count - a.email_count);
  const maxDownloads = Math.max(...byDownloads.map((b) => b.download_count), 1);
  const maxEmails = Math.max(...byEmails.map((b) => b.email_count), 1);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Books" value={books.length} />
        <StatCard label="Total Downloads" value={books.reduce((s, b) => s + b.download_count, 0)} />
        <StatCard label="Total Emails" value={books.reduce((s, b) => s + b.email_count, 0)} />
        <StatCard
          label="Avg Downloads/Book"
          value={books.length ? Math.round(books.reduce((s, b) => s + b.download_count, 0) / books.length) : 0}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ranked by Downloads */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-bold text-foreground">Books Ranked by Downloads</h2>
          </div>
          {byDownloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No books found.</p>
          ) : (
            <div className="space-y-2">
              {byDownloads.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={`text-sm font-bold w-7 text-center shrink-0 ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>
                    {i < 3 ? <Trophy className="h-4 w-4 mx-auto" /> : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author}{b.category_name ? ` · ${b.category_name}` : ""}</p>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(b.download_count / maxDownloads) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right">{b.download_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ranked by Emails */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-bold text-foreground">Books Ranked by Emails</h2>
          </div>
          {byEmails.length === 0 ? (
            <p className="text-sm text-muted-foreground">No books found.</p>
          ) : (
            <div className="space-y-2">
              {byEmails.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={`text-sm font-bold w-7 text-center shrink-0 ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>
                    {i < 3 ? <Trophy className="h-4 w-4 mx-auto" /> : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author}{b.category_name ? ` · ${b.category_name}` : ""}</p>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${(b.email_count / maxEmails) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right">{b.email_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-muted p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
  </div>
);

export default Analytics;

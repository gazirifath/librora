import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail, Download, TrendingUp, Calendar,
  FileDown, BarChart3, Trophy, Activity, Pencil, Eye
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { toast } from "sonner";

const DashboardHome = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterBook, setFilterBook] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Live data from DB via React Query (invalidated by useRealtimeSync)
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, author, download_count, categories(name)")
        .order("download_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: collectedEmails } = useQuery({
    queryKey: ["collected_emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collected_emails")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: downloadLogs } = useQuery({
    queryKey: ["download_logs"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("download_logs")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const emails = collectedEmails ?? [];

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split("T")[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStr = monthStart.toISOString().split("T")[0];

  const todayEmails = emails.filter(e => e.created_at?.startsWith(today));
  const thisWeekEmails = emails.filter(e => e.created_at >= weekStr);
  const thisMonthEmails = emails.filter(e => e.created_at >= monthStr);

  const totalDownloads = useMemo(() => {
    if (!posts) return 0;
    return posts.reduce((s: number, p: any) => s + (p.download_count || 0), 0);
  }, [posts]);

  const { dailyDownloads, todayDownloads } = useMemo(() => {
    if (!downloadLogs) return { dailyDownloads: [], todayDownloads: 0 };
    const map: Record<string, number> = {};
    const todayStr = new Date().toISOString().split("T")[0];
    let todayCount = 0;
    downloadLogs.forEach((d: any) => {
      const day = d.created_at.split("T")[0];
      map[day] = (map[day] || 0) + 1;
      if (day === todayStr) todayCount++;
    });
    return {
      todayDownloads: todayCount,
      dailyDownloads: Object.entries(map).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        count,
      })),
    };
  }, [downloadLogs]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach(e => {
      const title = e.post_title || "Unknown";
      map[title] = (map[title] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [emails]);

  const rankedBooks = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach(e => {
      const title = e.post_title || "Unknown";
      map[title] = (map[title] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [emails]);

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const eDate = e.created_at?.split("T")[0] || "";
      if (dateFrom && eDate < dateFrom) return false;
      if (dateTo && eDate > dateTo) return false;
      if (filterBook && e.post_id !== filterBook) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      return true;
    });
  }, [emails, dateFrom, dateTo, filterBook, filterCategory]);

  const categories = useMemo(() => [...new Set(emails.map(e => e.category).filter(Boolean))], [emails]);

  const handleExport = () => {
    const headers = ["Email", "Book", "Category", "Date"];
    const rows = filteredEmails.map(e => [
      `"${(e.email || "").replace(/"/g, '""')}"`,
      `"${(e.post_title || "").replace(/"/g, '""')}"`,
      `"${(e.category || "").replace(/"/g, '""')}"`,
      e.created_at?.split("T")[0] || "",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `librora-emails-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredEmails.length} emails`);
  };

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Emails", value: emails.length, icon: Mail },
          { label: "Today Emails", value: todayEmails.length, icon: Calendar },
          { label: "This Week", value: thisWeekEmails.length, icon: TrendingUp },
          { label: "This Month", value: thisMonthEmails.length, icon: Mail },
          { label: "Today Downloads", value: todayDownloads, icon: Activity },
          { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: Download },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-heading font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground">Daily Downloads (Last 30 Days)</h2>
        </div>
        <div className="h-56">
          {dailyDownloads.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyDownloads}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(152, 45%, 28%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No download data yet. Downloads will appear here in real-time.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground">Emails by Book</h2>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(152, 45%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden mb-8">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground">Books Ranked by Downloads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rank</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Book</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Downloads</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? []).map((post: any, i: number) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-bold">{i + 1}</td>
                  <td className="px-4 py-3 text-foreground">{post.title}</td>
                  <td className="px-4 py-3 text-right font-heading font-bold text-foreground">{(post.download_count || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/posts/edit/${post.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <Link to={`/${post.slug}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden mb-8">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground">Books Ranked by Emails</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rank</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Book</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Emails</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedBooks.map((book, i) => {
                const matchedPost = posts?.find((p: any) => p.title === book.name);
                return (
                  <tr key={book.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground font-bold">{i + 1}</td>
                    <td className="px-4 py-3 text-foreground">{book.name}</td>
                    <td className="px-4 py-3 text-right font-heading font-bold text-foreground">{book.count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {matchedPost ? (
                          <>
                            <Link to={`/admin/posts/edit/${matchedPost.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Link>
                            <Link to={`/${matchedPost.slug}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                              <Eye className="h-3.5 w-3.5" /> View
                            </Link>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileDown className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground">Export Emails</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Book</label>
            <select value={filterBook} onChange={e => setFilterBook(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All</option>
              {(posts ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{filteredEmails.length} emails match</span>
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <FileDown className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-heading font-bold text-foreground">Recent Emails</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Book</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.slice(0, 20).map(e => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{e.email}</td>
                  <td className="px-4 py-3 text-foreground">{e.post_title || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{e.category || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.created_at?.split("T")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;

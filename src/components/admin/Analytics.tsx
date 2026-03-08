import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Mail, Download, Trophy, TrendingUp, BookOpen, FileDown } from "lucide-react";
import { toast } from "sonner";
import TrendChart from "./TrendChart";

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
      const { data: posts, error: postsErr } = await supabase
        .from("posts")
        .select("id, title, author, download_count, categories(name)")
        .order("download_count", { ascending: false });
      if (postsErr) throw postsErr;

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

  const totalDownloads = books.reduce((s, b) => s + b.download_count, 0);
  const totalEmails = books.reduce((s, b) => s + b.email_count, 0);
  const avgDownloads = books.length ? Math.round(totalDownloads / books.length) : 0;
  const conversionRate = totalDownloads > 0 ? ((totalEmails / totalDownloads) * 100).toFixed(1) : "0";

  const byDownloads = [...books].sort((a, b) => b.download_count - a.download_count);
  const byEmails = [...books].sort((a, b) => b.email_count - a.email_count);
  const maxDownloads = Math.max(...byDownloads.map((b) => b.download_count), 1);
  const maxEmails = Math.max(...byEmails.map((b) => b.email_count), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your book performance and audience growth</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total Books"
          value={books.length}
          color="primary"
        />
        <KPICard
          icon={<Download className="h-5 w-5" />}
          label="Total Downloads"
          value={totalDownloads}
          color="primary"
          suffix={avgDownloads > 0 ? `~${avgDownloads}/book` : undefined}
        />
        <KPICard
          icon={<Mail className="h-5 w-5" />}
          label="Emails Collected"
          value={totalEmails}
          color="accent"
        />
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          color="primary"
          suffix="emails / downloads"
        />
      </div>

      {/* 30-Day Trend Chart */}
      <TrendChart />

      {/* Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Downloads Ranking */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground text-sm">Top by Downloads</h2>
                <p className="text-xs text-muted-foreground">{byDownloads.length} books tracked</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {byDownloads.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No data yet</p>
              </div>
            ) : (
              byDownloads.slice(0, 10).map((b, i) => (
                <RankRow
                  key={b.id}
                  rank={i + 1}
                  title={b.title}
                  subtitle={`${b.author}${b.category_name ? ` · ${b.category_name}` : ""}`}
                  value={b.download_count}
                  max={maxDownloads}
                  barColor="bg-primary"
                />
              ))
            )}
          </div>
        </div>

        {/* Emails Ranking */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent/10">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground text-sm">Top by Emails</h2>
                <p className="text-xs text-muted-foreground">{byEmails.length} books tracked</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {byEmails.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No data yet</p>
              </div>
            ) : (
              byEmails.slice(0, 10).map((b, i) => (
                <RankRow
                  key={b.id}
                  rank={i + 1}
                  title={b.title}
                  subtitle={`${b.author}${b.category_name ? ` · ${b.category_name}` : ""}`}
                  value={b.email_count}
                  max={maxEmails}
                  barColor="bg-accent"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "primary" | "accent";
  suffix?: string;
}) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2.5 mb-1.5">
      <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${
        color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
      }`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-2xl font-heading font-bold text-foreground tracking-tight">{value}</p>
    {suffix && <p className="text-xs text-muted-foreground mt-1">{suffix}</p>}
  </div>
);

const RankRow = ({
  rank,
  title,
  subtitle,
  value,
  max,
  barColor,
}: {
  rank: number;
  title: string;
  subtitle: string;
  value: number;
  max: number;
  barColor: string;
}) => (
  <div className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
    <div className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 text-xs font-bold ${
      rank <= 3
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground"
    }`}>
      {rank <= 3 ? <Trophy className="h-3.5 w-3.5" /> : rank}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
    <div className="w-32 shrink-0 flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.max((value / max) * 100, 2)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right tabular-nums">{value}</span>
    </div>
  </div>
);

export default Analytics;

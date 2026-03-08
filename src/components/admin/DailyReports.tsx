import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Mail,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Trophy,
  FileDown,
  RefreshCw,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface DailyReport {
  id: string;
  report_date: string;
  total_emails_today: number;
  total_downloads_today: number;
  top_books: { title: string; count: number }[];
  email_list: { email: string; post_title: string; category: string; time: string }[];
  created_at: string;
}

interface MonthlyAggregate {
  month: string;
  label: string;
  totalEmails: number;
  totalDownloads: number;
  topBooks: { title: string; count: number }[];
  days: number;
}

type TabType = "daily" | "monthly" | "yearly";

const aggregateMonthly = (reports: DailyReport[]): MonthlyAggregate[] => {
  const map = new Map<string, { emails: number; downloads: number; books: Map<string, number>; days: number }>();

  reports.forEach((r) => {
    const month = r.report_date.substring(0, 7);
    if (!map.has(month)) map.set(month, { emails: 0, downloads: 0, books: new Map(), days: 0 });
    const agg = map.get(month)!;
    agg.emails += r.total_emails_today;
    agg.downloads += r.total_downloads_today;
    agg.days += 1;
    r.top_books?.forEach((b) => {
      agg.books.set(b.title, (agg.books.get(b.title) || 0) + b.count);
    });
  });

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, agg]) => ({
      month,
      label: format(parseISO(month + "-01"), "MMMM yyyy"),
      totalEmails: agg.emails,
      totalDownloads: agg.downloads,
      days: agg.days,
      topBooks: Array.from(agg.books.entries())
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    }));
};

const DailyReports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [allReports, setAllReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<TabType>("daily");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(30);
    if (error) toast.error(error.message);
    else setReports((data as any) || []);

    const twelveMonthsAgo = format(subMonths(new Date(), 12), "yyyy-MM-dd");
    const { data: allData, error: allErr } = await supabase
      .from("daily_reports")
      .select("*")
      .gte("report_date", twelveMonthsAgo)
      .order("report_date", { ascending: false });
    if (!allErr) setAllReports((allData as any) || []);

    setLoading(false);
  };

  const generateNow = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-report");
      if (error) throw error;
      toast.success("Report generated for today!");
      fetchReports();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    }
    setGenerating(false);
  };

  const monthlyData = useMemo(() => aggregateMonthly(allReports), [allReports]);

  const yearlyTotals = useMemo(() => {
    const totalEmails = allReports.reduce((s, r) => s + r.total_emails_today, 0);
    const totalDownloads = allReports.reduce((s, r) => s + r.total_downloads_today, 0);
    const booksMap = new Map<string, number>();
    allReports.forEach((r) =>
      r.top_books?.forEach((b) => booksMap.set(b.title, (booksMap.get(b.title) || 0) + b.count))
    );
    const topBooks = Array.from(booksMap.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return { totalEmails, totalDownloads, topBooks, months: monthlyData.length };
  }, [allReports, monthlyData]);

  const exportDailyCSV = () => {
    if (!selectedReport) return;
    const headers = ["Email", "Book", "Category"];
    const rows = (selectedReport.email_list || []).map((e) => [
      `"${e.email}"`,
      `"${e.post_title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
    ]);
    downloadCSV(headers, rows, `report-${selectedReport.report_date}`);
  };

  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "daily", label: "Daily", icon: Calendar },
    { key: "monthly", label: "Monthly", icon: BarChart3 },
    { key: "yearly", label: "12 Months", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Daily, monthly & yearly performance summaries</p>
        </div>
        <button
          onClick={generateNow}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
          {generating ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={<FileText className="h-5 w-5" />}
          label="Total Reports"
          value={allReports.length}
          color="primary"
        />
        <QuickStat
          icon={<Mail className="h-5 w-5" />}
          label="Emails (12 mo)"
          value={yearlyTotals.totalEmails}
          color="accent"
        />
        <QuickStat
          icon={<Download className="h-5 w-5" />}
          label="Downloads (12 mo)"
          value={yearlyTotals.totalDownloads}
          color="primary"
        />
        <QuickStat
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Emails/Mo"
          value={yearlyTotals.months ? Math.round(yearlyTotals.totalEmails / yearlyTotals.months) : 0}
          color="accent"
        />
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-3">
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedReport(null); setSelectedMonth(null); }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  tab === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Daily Tab */}
          {tab === "daily" && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Report List */}
              <div className="md:col-span-1">
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {reports.length === 0 ? (
                    <EmptyListState message='No reports yet. Click "Generate Report" to create one.' />
                  ) : (
                    reports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className={cn(
                          "w-full text-left rounded-lg border p-3.5 transition-all group",
                          selectedReport?.id === r.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "flex items-center justify-center h-7 w-7 rounded-md",
                              selectedReport?.id === r.id ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {format(parseISO(r.report_date), "MMM d, yyyy")}
                            </span>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            selectedReport?.id === r.id && "text-primary translate-x-0.5"
                          )} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {r.total_emails_today}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" /> {r.total_downloads_today}
                          </span>
                          {r.top_books?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {r.top_books.length} books
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Report Detail */}
              <div className="md:col-span-2">
                {selectedReport ? <ReportDetail report={selectedReport} onExport={exportDailyCSV} /> : <EmptyDetailState />}
              </div>
            </div>
          )}

          {/* Monthly Tab */}
          {tab === "monthly" && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {monthlyData.length === 0 ? (
                    <EmptyListState message="No monthly data available." />
                  ) : (
                    monthlyData.map((m) => (
                      <button
                        key={m.month}
                        onClick={() => setSelectedMonth(m)}
                        className={cn(
                          "w-full text-left rounded-lg border p-3.5 transition-all group",
                          selectedMonth?.month === m.month
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "flex items-center justify-center h-7 w-7 rounded-md",
                              selectedMonth?.month === m.month ? "bg-primary/10" : "bg-muted"
                            )}>
                              <BarChart3 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{m.label}</span>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            selectedMonth?.month === m.month && "text-primary translate-x-0.5"
                          )} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.totalEmails}</span>
                          <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {m.totalDownloads}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.days} days</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                {selectedMonth ? <MonthDetail month={selectedMonth} /> : <EmptyDetailState />}
              </div>
            </div>
          )}

          {/* Yearly Tab */}
          {tab === "yearly" && (
            <div className="space-y-6">
              {/* Monthly Breakdown */}
              <div>
                <h3 className="font-heading font-bold text-foreground text-sm mb-4">Monthly Breakdown</h3>
                {monthlyData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                  <div className="space-y-3">
                    {monthlyData.map((m) => {
                      const maxEmails = Math.max(...monthlyData.map((d) => d.totalEmails), 1);
                      const maxDownloads = Math.max(...monthlyData.map((d) => d.totalDownloads), 1);
                      return (
                        <div key={m.month} className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-foreground">{m.label}</span>
                            <span className="text-xs text-muted-foreground">{m.days} report days</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 w-24 shrink-0">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs text-muted-foreground">Emails</span>
                              </div>
                              <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max((m.totalEmails / maxEmails) * 100, 2)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-foreground w-10 text-right tabular-nums">{m.totalEmails}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 w-24 shrink-0">
                                <Download className="h-3.5 w-3.5 text-accent" />
                                <span className="text-xs text-muted-foreground">Downloads</span>
                              </div>
                              <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-accent h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max((m.totalDownloads / maxDownloads) * 100, 2)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-foreground w-10 text-right tabular-nums">{m.totalDownloads}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Books */}
              {yearlyTotals.topBooks.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-foreground text-sm mb-4">Top Books (Last 12 Months)</h3>
                  <TopBooksCard books={yearlyTotals.topBooks} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

const QuickStat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "accent";
}) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2.5 mb-1.5">
      <div className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-lg",
        color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
      )}>
        {icon}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-2xl font-heading font-bold text-foreground tracking-tight tabular-nums">{value}</p>
  </div>
);

const TopBooksCard = ({ books }: { books: { title: string; count: number }[] }) => {
  const max = Math.max(...books.map((b) => b.count), 1);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
      {books.map((b, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
          <div className={cn(
            "flex items-center justify-center h-7 w-7 rounded-full shrink-0 text-xs font-bold",
            i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {i < 3 ? <Trophy className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <p className="text-sm font-medium text-foreground truncate flex-1">{b.title}</p>
          <div className="w-28 shrink-0 flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max((b.count / max) * 100, 2)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground w-8 text-right tabular-nums">{b.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportDetail = ({ report, onExport }: { report: DailyReport; onExport: () => void }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="px-6 py-4 border-b border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-foreground text-sm">
              {format(parseISO(report.report_date), "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-xs text-muted-foreground">Daily performance summary</p>
          </div>
        </div>
        {report.email_list?.length > 0 && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export
          </button>
        )}
      </div>
    </div>

    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emails</span>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground tabular-nums">{report.total_emails_today}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Download className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Downloads</span>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground tabular-nums">{report.total_downloads_today}</p>
        </div>
      </div>

      {/* Top Books */}
      {report.top_books?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Top Books
          </h3>
          <TopBooksCard books={report.top_books} />
        </div>
      )}

      {/* Email Table */}
      {report.email_list?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Collected Emails
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Book</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.email_list.map((e, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-foreground font-medium">{e.email}</td>
                      <td className="px-4 py-2.5 text-foreground truncate max-w-[200px]">{e.post_title}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {e.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const MonthDetail = ({ month }: { month: MonthlyAggregate }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="px-6 py-4 border-b border-border bg-muted/30">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-sm">{month.label}</h2>
          <p className="text-xs text-muted-foreground">{month.days} report days aggregated</p>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emails</span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground tabular-nums">{month.totalEmails}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Download className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Downloads</span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground tabular-nums">{month.totalDownloads}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Days</span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground tabular-nums">{month.days}</p>
        </div>
      </div>

      {month.topBooks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Top Books
          </h3>
          <TopBooksCard books={month.topBooks} />
        </div>
      )}
    </div>
  </div>
);

const EmptyDetailState = () => (
  <div className="rounded-xl border border-border bg-card p-16 text-center">
    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted mx-auto mb-4">
      <FileText className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground mb-1">No report selected</p>
    <p className="text-xs text-muted-foreground">Select a report from the list to view details</p>
  </div>
);

const EmptyListState = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export default DailyReports;

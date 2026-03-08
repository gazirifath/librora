import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Mail, Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";

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
  month: string; // e.g. "2026-03"
  label: string; // e.g. "March 2026"
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
    // Fetch last 30 for daily view
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(30);
    if (error) toast.error(error.message);
    else setReports((data as any) || []);

    // Fetch last 12 months for monthly/yearly views
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

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "daily", label: "Daily", icon: Calendar },
    { key: "monthly", label: "Monthly", icon: BarChart3 },
    { key: "yearly", label: "Last 12 Months", icon: TrendingUp },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Reports</h1>
        <button
          onClick={generateNow}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Now"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedReport(null); setSelectedMonth(null); }}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Daily Tab */}
      {tab === "daily" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet. Click "Generate Now" to create one.</p>
            ) : (
              reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedReport?.id === r.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{r.report_date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {r.total_emails_today} emails</span>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {r.total_downloads_today} downloads</span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="md:col-span-2">
            {selectedReport ? <ReportDetail report={selectedReport} /> : <EmptyState />}
          </div>
        </div>
      )}

      {/* Monthly Tab */}
      {tab === "monthly" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No monthly data available.</p>
            ) : (
              monthlyData.map((m) => (
                <button
                  key={m.month}
                  onClick={() => setSelectedMonth(m)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedMonth?.month === m.month ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {m.totalEmails} emails</span>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {m.totalDownloads} downloads</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{m.days} report day(s)</div>
                </button>
              ))
            )}
          </div>
          <div className="md:col-span-2">
            {selectedMonth ? (
              <div className="rounded-lg border border-border bg-card p-5 space-y-6">
                <h2 className="font-heading font-bold text-foreground">{selectedMonth.label}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Emails Collected" value={selectedMonth.totalEmails} />
                  <StatCard label="Downloads" value={selectedMonth.totalDownloads} />
                  <StatCard label="Report Days" value={selectedMonth.days} />
                </div>
                <TopBooksTable books={selectedMonth.topBooks} />
              </div>
            ) : <EmptyState />}
          </div>
        </div>
      )}

      {/* Yearly (Last 12 Months) Tab */}
      {tab === "yearly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Emails (12 mo)" value={yearlyTotals.totalEmails} />
            <StatCard label="Total Downloads (12 mo)" value={yearlyTotals.totalDownloads} />
            <StatCard label="Months Tracked" value={yearlyTotals.months} />
            <StatCard label="Avg Emails/Month" value={yearlyTotals.months ? Math.round(yearlyTotals.totalEmails / yearlyTotals.months) : 0} />
          </div>

          {/* Monthly breakdown chart-like table */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading font-bold text-foreground mb-4">Monthly Breakdown</h2>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              <div className="space-y-2">
                {monthlyData.map((m) => {
                  const maxEmails = Math.max(...monthlyData.map((d) => d.totalEmails), 1);
                  const maxDownloads = Math.max(...monthlyData.map((d) => d.totalDownloads), 1);
                  return (
                    <div key={m.month} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <span className="text-sm font-medium text-foreground w-32 shrink-0">{m.label}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-primary shrink-0" />
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${(m.totalEmails / maxEmails) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{m.totalEmails}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-3 w-3 text-accent-foreground shrink-0" />
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-accent h-full rounded-full transition-all"
                              style={{ width: `${(m.totalDownloads / maxDownloads) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{m.totalDownloads}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top books across 12 months */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading font-bold text-foreground mb-4">Top Books (Last 12 Months)</h2>
            <TopBooksTable books={yearlyTotals.topBooks} />
          </div>
        </div>
      )}
    </>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-muted p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
  </div>
);

const TopBooksTable = ({ books }: { books: { title: string; count: number }[] }) => {
  if (!books?.length) return <p className="text-sm text-muted-foreground">No book data.</p>;
  return (
    <div className="space-y-1">
      {books.map((b, i) => (
        <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
          <span className="text-foreground">{i + 1}. {b.title}</span>
          <span className="text-muted-foreground font-medium">{b.count}</span>
        </div>
      ))}
    </div>
  );
};

const ReportDetail = ({ report }: { report: DailyReport }) => (
  <div className="rounded-lg border border-border bg-card p-5 space-y-6">
    <h2 className="font-heading font-bold text-foreground">Report for {report.report_date}</h2>
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Emails Collected" value={report.total_emails_today} />
      <StatCard label="Downloads" value={report.total_downloads_today} />
    </div>
    {report.top_books?.length > 0 && (
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Top Books by Emails</h3>
        <TopBooksTable books={report.top_books} />
      </div>
    )}
    {report.email_list?.length > 0 && (
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Collected Emails</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Book</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
              </tr>
            </thead>
            <tbody>
              {report.email_list.map((e, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-foreground">{e.email}</td>
                  <td className="px-3 py-2 text-foreground">{e.post_title}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{e.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-border bg-card p-12 text-center">
    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
    <p className="text-sm text-muted-foreground">Select an item to view details</p>
  </div>
);

export default DailyReports;

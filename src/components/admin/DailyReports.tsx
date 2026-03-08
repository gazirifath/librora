import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Mail, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface DailyReport {
  id: string;
  report_date: string;
  total_emails_today: number;
  total_downloads_today: number;
  top_books: { title: string; count: number }[];
  email_list: { email: string; post_title: string; category: string; time: string }[];
  created_at: string;
}

const DailyReports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Daily Reports</h1>
        <button
          onClick={generateNow}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Now"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Reports list */}
        <div className="md:col-span-1 space-y-2">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet. Click "Generate Now" to create one.</p>
          ) : (
            reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedReport?.id === r.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{r.report_date}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {r.total_emails_today} emails
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" /> {r.total_downloads_today} downloads
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Report detail */}
        <div className="md:col-span-2">
          {selectedReport ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-heading font-bold text-foreground mb-4">
                  Report for {selectedReport.report_date}
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Emails Collected</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{selectedReport.total_emails_today}</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Downloads</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{selectedReport.total_downloads_today}</p>
                  </div>
                </div>

                {/* Top books */}
                {selectedReport.top_books && selectedReport.top_books.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-2">Top Books by Emails</h3>
                    <div className="space-y-1">
                      {selectedReport.top_books.map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                          <span className="text-foreground">{i + 1}. {b.title}</span>
                          <span className="text-muted-foreground font-medium">{b.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email list */}
                {selectedReport.email_list && selectedReport.email_list.length > 0 && (
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
                          {selectedReport.email_list.map((e, i) => (
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
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DailyReports;

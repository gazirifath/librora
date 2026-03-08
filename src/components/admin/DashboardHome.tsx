import { useState, useMemo } from "react";
import { getEmails, exportEmailsCSV, books } from "@/data/books";
import {
  Mail, Download, TrendingUp, Calendar,
  FileDown, BarChart3, Trophy
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";

const DashboardHome = () => {
  const emails = getEmails();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterBook, setFilterBook] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayEmails = emails.filter(e => e.date === today);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split("T")[0];
  const thisWeekEmails = emails.filter(e => e.date >= weekStr);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStr = monthStart.toISOString().split("T")[0];
  const thisMonthEmails = emails.filter(e => e.date >= monthStr);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach(e => { map[e.bookTitle] = (map[e.bookTitle] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [emails]);

  const rankedBooks = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach(e => { map[e.bookTitle] = (map[e.bookTitle] || 0) + 1; });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [emails]);

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (filterBook && e.bookSlug !== filterBook) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      return true;
    });
  }, [emails, dateFrom, dateTo, filterBook, filterCategory]);

  const handleExport = () => {
    const csv = exportEmailsCSV(filteredEmails);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `librora-emails-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredEmails.length} emails`);
  };

  const categories = [...new Set(emails.map(e => e.category))];

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Emails", value: emails.length, icon: Mail },
          { label: "Today", value: todayEmails.length, icon: Calendar },
          { label: "This Week", value: thisWeekEmails.length, icon: TrendingUp },
          { label: "This Month", value: thisMonthEmails.length, icon: Mail },
          { label: "Downloads", value: books.reduce((s, b) => s + b.downloadCount, 0).toLocaleString(), icon: Download },
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
              </tr>
            </thead>
            <tbody>
              {[...books].sort((a, b) => b.downloadCount - a.downloadCount).map((book, i) => (
                <tr key={book.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-bold">{i + 1}</td>
                  <td className="px-4 py-3 text-foreground">{book.title}</td>
                  <td className="px-4 py-3 text-right font-heading font-bold text-foreground">{book.downloadCount.toLocaleString()}</td>
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
              </tr>
            </thead>
            <tbody>
              {rankedBooks.map((book, i) => (
                <tr key={book.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-bold">{i + 1}</td>
                  <td className="px-4 py-3 text-foreground">{book.name}</td>
                  <td className="px-4 py-3 text-right font-heading font-bold text-foreground">{book.count}</td>
                </tr>
              ))}
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
              {books.map(b => <option key={b.slug} value={b.slug}>{b.title}</option>)}
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
              {[...filteredEmails].reverse().slice(0, 20).map(e => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{e.email}</td>
                  <td className="px-4 py-3 text-foreground">{e.bookTitle}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
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

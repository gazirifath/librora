import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar } from "lucide-react";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

interface DayData {
  date: string;
  label: string;
  downloads: number;
  emails: number;
}

const TrendChart = () => {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 29);
      const startISO = startDate.toISOString();

      const [{ data: downloads }, { data: emails }] = await Promise.all([
        supabase
          .from("download_logs")
          .select("created_at")
          .gte("created_at", startISO),
        supabase
          .from("collected_emails")
          .select("created_at")
          .gte("created_at", startISO),
      ]);

      const downloadMap = new Map<string, number>();
      const emailMap = new Map<string, number>();

      (downloads || []).forEach((d: any) => {
        const day = d.created_at.split("T")[0];
        downloadMap.set(day, (downloadMap.get(day) || 0) + 1);
      });

      (emails || []).forEach((e: any) => {
        const day = e.created_at.split("T")[0];
        emailMap.set(day, (emailMap.get(day) || 0) + 1);
      });

      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const chartData: DayData[] = days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return {
          date: dateStr,
          label: format(day, "MMM d"),
          downloads: downloadMap.get(dateStr) || 0,
          emails: emailMap.get(dateStr) || 0,
        };
      });

      setData(chartData);
    } catch (err) {
      console.error("Trend fetch error:", err);
    }
    setLoading(false);
  };

  const totalDownloads = data.reduce((s, d) => s + d.downloads, 0);
  const totalEmails = data.reduce((s, d) => s + d.emails, 0);

  if (loading) {
    return <div className="rounded-xl border border-border bg-card h-80 animate-pulse" />;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-foreground text-sm">30-Day Trends</h2>
            <p className="text-xs text-muted-foreground">Downloads & emails over time</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Downloads</p>
            <p className="text-sm font-bold text-foreground tabular-nums">{totalDownloads}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Emails</p>
            <p className="text-sm font-bold text-foreground tabular-nums">{totalEmails}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEmails" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(42, 85%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(42, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 88%)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(150, 10%, 45%)" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(150, 10%, 45%)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(45, 30%, 97%)",
                border: "1px solid hsl(150, 15%, 88%)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ fontSize: 12, color: "hsl(150, 10%, 45%)" }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="downloads"
              name="Downloads"
              stroke="hsl(152, 45%, 28%)"
              strokeWidth={2}
              fill="url(#gradDownloads)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="emails"
              name="Emails"
              stroke="hsl(42, 85%, 55%)"
              strokeWidth={2}
              fill="url(#gradEmails)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DayData {
  date: string;
  label: string;
  downloads: number;
  emails: number;
}

type Preset = "7d" | "14d" | "30d" | "90d" | "custom";

const TrendChart = () => {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateRange = () => {
    const end = new Date();
    if (preset === "custom" && customFrom && customTo) {
      return { start: customFrom, end: customTo };
    }
    const days = preset === "7d" ? 6 : preset === "14d" ? 13 : preset === "90d" ? 89 : 29;
    return { start: subDays(end, days), end };
  };

  useEffect(() => {
    if (preset === "custom" && (!customFrom || !customTo)) return;
    fetchTrends();
  }, [preset, customFrom, customTo]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const startISO = start.toISOString();
      const endISO = new Date(end.getTime() + 86400000).toISOString();

      const [{ data: downloads }, { data: emails }] = await Promise.all([
        supabase.from("download_logs").select("created_at").gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("collected_emails").select("created_at").gte("created_at", startISO).lt("created_at", endISO),
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

      const days = eachDayOfInterval({ start, end });
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

  const presets: { key: Preset; label: string }[] = [
    { key: "7d", label: "7 days" },
    { key: "14d", label: "14 days" },
    { key: "30d", label: "30 days" },
    { key: "90d", label: "90 days" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm">Trends</h2>
              <p className="text-xs text-muted-foreground">Downloads & emails over time</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Preset buttons */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0",
                    preset === p.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom date pickers */}
            {preset === "custom" && (
              <div className="flex items-center gap-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("text-xs h-8", !customFrom && "text-muted-foreground")}>
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                      {customFrom ? format(customFrom, "MMM d, yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      disabled={(date) => date > new Date() || (customTo ? date > customTo : false)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground">→</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("text-xs h-8", !customTo && "text-muted-foreground")}>
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                      {customTo ? format(customTo, "MMM d, yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      disabled={(date) => date > new Date() || (customFrom ? date < customFrom : false)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Totals */}
            <div className="flex gap-4 ml-auto">
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
        </div>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
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
                interval={Math.max(Math.floor(data.length / 7) - 1, 0)}
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
        )}
      </div>
    </div>
  );
};

export default TrendChart;

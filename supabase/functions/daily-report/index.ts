import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    const reportDate = today.toISOString().split("T")[0];
    const startOfDay = `${reportDate}T00:00:00.000Z`;
    const endOfDay = `${reportDate}T23:59:59.999Z`;

    // Get today's collected emails
    const { data: emails } = await supabase
      .from("collected_emails")
      .select("email, post_title, category, created_at")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    // Get today's downloads
    const { data: downloads } = await supabase
      .from("download_logs")
      .select("post_title, created_at")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    // Top books by email count
    const bookMap: Record<string, number> = {};
    (emails || []).forEach((e) => {
      const title = e.post_title || "Unknown";
      bookMap[title] = (bookMap[title] || 0) + 1;
    });
    const topBooks = Object.entries(bookMap)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Email list
    const emailList = (emails || []).map((e) => ({
      email: e.email,
      post_title: e.post_title,
      category: e.category,
      time: e.created_at,
    }));

    // Upsert daily report
    const { error } = await supabase
      .from("daily_reports")
      .upsert(
        {
          report_date: reportDate,
          total_emails_today: emails?.length || 0,
          total_downloads_today: downloads?.length || 0,
          top_books: topBooks,
          email_list: emailList,
        },
        { onConflict: "report_date" }
      );

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        report_date: reportDate,
        total_emails: emails?.length || 0,
        total_downloads: downloads?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

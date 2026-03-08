import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WATCHED_TABLES = [
  { table: "posts", queryKeys: [["posts"]] },
  { table: "categories", queryKeys: [["categories"]] },
  { table: "tags", queryKeys: [["tags"]] },
  { table: "pages", queryKeys: [["pages"]] },
  { table: "media", queryKeys: [["media"]] },
  { table: "site_settings", queryKeys: [["settings"]] },
  { table: "collected_emails", queryKeys: [["collected_emails"]] },
  { table: "newsletter_subscribers", queryKeys: [["newsletter_subscribers"]] },
  { table: "download_logs", queryKeys: [["download_logs"]] },
  { table: "daily_reports", queryKeys: [["daily_reports"]] },
  { table: "page_views", queryKeys: [["page_views"]] },
] as const;

const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          const tableName = payload.table;
          const match = WATCHED_TABLES.find((w) => w.table === tableName);
          if (match) {
            match.queryKeys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: key });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export default useRealtimeSync;

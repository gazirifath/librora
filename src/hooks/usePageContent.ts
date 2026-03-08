import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const usePageBySlug = (slug: string) => useQuery({
  queryKey: ["page-by-slug", slug],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error) throw error;
    return data;
  },
});

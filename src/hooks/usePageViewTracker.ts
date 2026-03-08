import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const usePageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin routes
    if (location.pathname.startsWith("/admin")) return;

    supabase
      .from("page_views")
      .insert({ path: location.pathname })
      .then(({ error }) => {
        if (error) console.error("Page view tracking error:", error);
      });
  }, [location.pathname]);
};

export default usePageViewTracker;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Categories
export const useCategories = () => useQuery({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; slug: string; description?: string }) => {
      const { error } = await supabase.from("categories").insert(cat);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category created"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Tags
export const useTags = () => useQuery({
  queryKey: ["tags"],
  queryFn: async () => {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tag: { name: string; slug: string; description?: string }) => {
      const { error } = await supabase.from("tags").insert(tag);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); toast.success("Tag created"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tags"] }); toast.success("Tag deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Posts
export const usePosts = () => useQuery({
  queryKey: ["posts"],
  queryFn: async () => {
    const { data, error } = await supabase.from("posts").select("*, categories(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const usePost = (id: string) => useQuery({
  queryKey: ["posts", id],
  queryFn: async () => {
    const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  enabled: !!id,
});

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: Record<string, unknown>) => {
      const { error } = await supabase.from("posts").insert(post as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post created"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase.from("posts").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Pages
export const usePages = () => useQuery({
  queryKey: ["pages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("pages").select("*").order("title");
    if (error) throw error;
    return data;
  },
});

export const useCreatePage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; content?: string; status?: string }) => {
      const { error } = await supabase.from("pages").insert(page);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page created"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdatePage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; slug?: string; content?: string; status?: string }) => {
      const { error } = await supabase.from("pages").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeletePage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Media
export const useMedia = () => useQuery({
  queryKey: ["media"],
  queryFn: async () => {
    const { data, error } = await supabase.from("media").select("*").order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const useDeleteMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      await supabase.storage.from("media").remove([filename]);
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["media"] }); toast.success("File deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Settings
export const useSettings = () => useQuery({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const map: Record<string, string> = {};
    data.forEach((s: any) => { map[s.key] = s.value; });
    return map;
  },
});

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Settings saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Collected Emails
export const useCollectedEmails = () => useQuery({
  queryKey: ["collected_emails"],
  queryFn: async () => {
    const { data, error } = await supabase.from("collected_emails").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

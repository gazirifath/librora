
CREATE TABLE public.download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  post_title text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert downloads" ON public.download_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read downloads" ON public.download_logs FOR SELECT TO authenticated USING (true);

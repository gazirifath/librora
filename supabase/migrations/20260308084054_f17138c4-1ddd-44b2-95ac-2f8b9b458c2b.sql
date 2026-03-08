
CREATE TABLE public.daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  total_emails_today integer NOT NULL DEFAULT 0,
  total_downloads_today integer NOT NULL DEFAULT 0,
  top_books jsonb NOT NULL DEFAULT '[]'::jsonb,
  email_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read reports" ON public.daily_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can insert reports" ON public.daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update reports" ON public.daily_reports FOR UPDATE USING (true) WITH CHECK (true);

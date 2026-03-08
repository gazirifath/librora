
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (true);

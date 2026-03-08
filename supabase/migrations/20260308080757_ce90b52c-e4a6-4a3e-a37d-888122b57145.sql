
-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tags" ON public.tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Posts (books) table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  summary TEXT DEFAULT '',
  key_lessons TEXT[] DEFAULT '{}',
  faq JSONB DEFAULT '[]',
  affiliate_url TEXT DEFAULT '',
  download_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  download_count INT DEFAULT 0,
  reading_time TEXT DEFAULT '5 min',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON public.posts FOR SELECT USING (status = 'published' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Authenticated can manage posts" ON public.posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Post tags junction
CREATE TABLE public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read post_tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage post_tags" ON public.post_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published pages" ON public.pages FOR SELECT USING (status = 'published' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Authenticated can manage pages" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT DEFAULT '',
  file_size INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage media" ON public.media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site settings table
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Collected emails table
CREATE TABLE public.collected_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  post_title TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.collected_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read emails" ON public.collected_emails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert emails" ON public.collected_emails FOR INSERT WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Self-Help', 'self-help'),
  ('Business', 'business'),
  ('Psychology', 'psychology'),
  ('Productivity', 'productivity'),
  ('Finance', 'finance'),
  ('Leadership', 'leadership'),
  ('Health', 'health'),
  ('Philosophy', 'philosophy');

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_title', 'Librora'),
  ('tagline', 'Free Book Summaries'),
  ('site_url', ''),
  ('admin_email', 'rifath.swe@gmail.com'),
  ('permalink_structure', 'post-name'),
  ('posts_per_page', '10'),
  ('homepage_display', 'latest'),
  ('default_category', 'self-help'),
  ('allow_comments', 'true'),
  ('comment_moderation', 'hold'),
  ('cookie_consent', 'true'),
  ('privacy_page', 'privacy');

-- Seed default pages
INSERT INTO public.pages (title, slug, content, status) VALUES
  ('Home', 'home', '', 'published'),
  ('Privacy Policy', 'privacy', '', 'published'),
  ('Terms', 'terms', '', 'published'),
  ('Affiliate Disclosure', 'affiliate-disclosure', '', 'published'),
  ('DMCA', 'dmca', '', 'published');

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
CREATE POLICY "Public can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated can delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');


DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
CREATE POLICY "Public can read posts" ON public.posts
  FOR SELECT
  USING (true);

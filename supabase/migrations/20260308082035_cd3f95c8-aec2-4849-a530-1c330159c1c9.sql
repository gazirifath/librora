
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS cover_alt_text text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_title text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_caption text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_description text DEFAULT '';


CREATE OR REPLACE FUNCTION public.validate_code_snippets()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  arr jsonb;
  item jsonb;
  code text;
  name text;
  placement text;
BEGIN
  IF NEW.key <> 'code_snippets' THEN
    RETURN NEW;
  END IF;

  IF length(NEW.value) > 250000 THEN
    RAISE EXCEPTION 'code_snippets payload too large (max 250000 chars)';
  END IF;

  BEGIN
    arr := NEW.value::jsonb;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'code_snippets must be valid JSON';
  END;

  IF jsonb_typeof(arr) <> 'array' THEN
    RAISE EXCEPTION 'code_snippets must be a JSON array';
  END IF;

  IF jsonb_array_length(arr) > 50 THEN
    RAISE EXCEPTION 'too many snippets (max 50)';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(arr) LOOP
    IF jsonb_typeof(item) <> 'object' THEN
      RAISE EXCEPTION 'each snippet must be an object';
    END IF;

    name := coalesce(item->>'name', '');
    code := coalesce(item->>'code', '');
    placement := coalesce(item->>'placement', 'head');

    IF length(name) > 100 THEN
      RAISE EXCEPTION 'snippet name too long (max 100)';
    END IF;
    IF length(code) > 50000 THEN
      RAISE EXCEPTION 'snippet code too long (max 50000) for "%"', name;
    END IF;
    IF placement NOT IN ('head', 'body_start', 'body_end') THEN
      RAISE EXCEPTION 'invalid placement "%" for snippet "%"', placement, name;
    END IF;

    IF code ~* '<\s*(object|embed|form|base|applet)\b' THEN
      RAISE EXCEPTION 'snippet "%" contains a blocked tag', name;
    END IF;
    IF code ~* '(href|src|action|formaction)\s*=\s*[''"]?\s*(javascript|vbscript|data:text/html)' THEN
      RAISE EXCEPTION 'snippet "%" contains a blocked URL scheme', name;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_code_snippets_trigger ON public.site_settings;
CREATE TRIGGER validate_code_snippets_trigger
BEFORE INSERT OR UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.validate_code_snippets();

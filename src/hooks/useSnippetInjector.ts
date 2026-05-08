import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Placement = "head" | "body_start" | "body_end";

type Snippet = {
  id: string;
  name: string;
  code: string;
  placement: Placement;
  active: boolean;
};

const SNIPPETS_KEY = "code_snippets";
const ATTR = "data-snippet-id";

const normalizePlacement = (value: unknown): Placement =>
  value === "body_start" || value === "body_end" ? value : "head";

/**
 * Parse snippet HTML/JS and inject DOM nodes into the target.
 * Re-creates <script> tags so the browser actually executes them
 * (innerHTML <script> tags do NOT execute).
 */
const injectSnippet = (snippet: Snippet) => {
  const target =
    snippet.placement === "head"
      ? document.head
      : document.body;

  const container = document.createElement("template");
  container.innerHTML = snippet.code;

  const fragment = container.content;
  const nodes: Node[] = [];

  fragment.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
      const original = node as HTMLScriptElement;
      const script = document.createElement("script");
      for (const { name, value } of Array.from(original.attributes)) {
        script.setAttribute(name, value);
      }
      script.text = original.textContent ?? "";
      script.setAttribute(ATTR, snippet.id);
      nodes.push(script);
    } else {
      if (node.nodeType === Node.ELEMENT_NODE) {
        (node as Element).setAttribute(ATTR, snippet.id);
      }
      nodes.push(node);
    }
  });

  if (snippet.placement === "body_start" && document.body.firstChild) {
    nodes.forEach((n) => document.body.insertBefore(n, document.body.firstChild));
  } else {
    nodes.forEach((n) => target.appendChild(n));
  }
};

const removeAllInjected = () => {
  document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.remove());
};

const useSnippetInjector = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      removeAllInjected();
      return;
    }

    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", SNIPPETS_KEY)
        .maybeSingle();

      if (cancelled || error || !data?.value) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(data.value);
      } catch {
        return;
      }
      if (!Array.isArray(parsed)) return;

      removeAllInjected();

      parsed.forEach((raw: any) => {
        if (!raw || raw.active === false || !raw.code) return;
        injectSnippet({
          id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
          name: raw.name ?? "Snippet",
          code: String(raw.code),
          placement: normalizePlacement(raw.placement),
          active: true,
        });
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);
};

export default useSnippetInjector;

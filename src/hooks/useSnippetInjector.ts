import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasConsentedCookies } from "@/lib/cookies";
import { validateSnippet } from "@/lib/snippetValidation";

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
const NONCE_META = "csp-nonce";

/**
 * Resolve a CSP nonce for this page.
 * Priority:
 *   1. <meta name="csp-nonce" content="..."> rendered by the server
 *   2. nonce attribute on the bootstrap script tag
 *   3. freshly generated random nonce (registered as a meta tag so the rest
 *      of the app can read it via `getCspNonce()`)
 */
export const getCspNonce = (): string => {
  if (typeof document === "undefined") return "";

  const meta = document.querySelector<HTMLMetaElement>(`meta[name="${NONCE_META}"]`);
  if (meta?.content) return meta.content;

  const bootScript = document.querySelector<HTMLScriptElement>("script[nonce]");
  const fromScript = bootScript?.nonce || bootScript?.getAttribute("nonce") || "";
  if (fromScript) {
    upsertNonceMeta(fromScript);
    return fromScript;
  }

  const generated = generateNonce();
  upsertNonceMeta(generated);
  return generated;
};

const generateNonce = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/=+$/, "");
};

const upsertNonceMeta = (nonce: string) => {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${NONCE_META}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = NONCE_META;
    document.head.appendChild(meta);
  }
  meta.content = nonce;
};

const normalizePlacement = (value: unknown): Placement =>
  value === "body_start" || value === "body_end" ? value : "head";

/**
 * Parse snippet HTML/JS and inject DOM nodes into the target.
 * Re-creates <script> tags so the browser actually executes them
 * (innerHTML <script> tags do NOT execute) and stamps each script/style
 * with the page CSP nonce so a strict-dynamic CSP can allow them.
 */
const injectSnippet = (snippet: Snippet, nonce: string) => {
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
        if (name.toLowerCase() === "nonce") continue;
        script.setAttribute(name, value);
      }
      script.text = original.textContent ?? "";
      script.setAttribute(ATTR, snippet.id);
      if (nonce) {
        script.setAttribute("nonce", nonce);
        // Some browsers expose `nonce` only via the IDL property.
        try { (script as any).nonce = nonce; } catch {}
      }
      nodes.push(script);
    } else {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        el.setAttribute(ATTR, snippet.id);
        if (nonce && (el.tagName === "STYLE" || el.tagName === "LINK")) {
          el.setAttribute("nonce", nonce);
        }
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
  const [consented, setConsented] = useState<boolean>(() =>
    typeof window !== "undefined" ? hasConsentedCookies() : false
  );

  // Listen for consent changes (accept/revoke dispatched via custom event + storage).
  useEffect(() => {
    const refresh = () => setConsented(hasConsentedCookies());
    window.addEventListener("open-cookie-preferences", refresh);
    window.addEventListener("cookie-consent-changed", refresh);
    window.addEventListener("storage", refresh);
    const interval = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("open-cookie-preferences", refresh);
      window.removeEventListener("cookie-consent-changed", refresh);
      window.removeEventListener("storage", refresh);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isAdmin || !consented) {
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
      const nonce = getCspNonce();

      parsed.forEach((raw: any) => {
        if (!raw || raw.active === false || !raw.code) return;
        const placement = normalizePlacement(raw.placement);
        const check = validateSnippet({
          name: raw.name ?? "Snippet",
          code: String(raw.code),
          placement,
        });
        if (!check.valid) {
          // eslint-disable-next-line no-console
          console.warn("[snippets] skipped invalid snippet:", raw.name, check.errors);
          return;
        }
        injectSnippet({
          id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
          name: raw.name ?? "Snippet",
          code: check.sanitizedCode,
          placement,
          active: true,
        });
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, consented]);
};

export default useSnippetInjector;

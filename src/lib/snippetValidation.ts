// Shared validation/sanitization for admin code snippets.
// Snippets are intentionally executable (analytics, tags), so we cannot
// strip <script>. Instead we block well-known XSS/CSP-breaking patterns.

export type SnippetPlacement = "head" | "body_start" | "body_end";

export interface SnippetInput {
  name: string;
  code: string;
  placement: SnippetPlacement;
  description?: string;
}

export interface SnippetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedCode: string;
}

export const SNIPPET_LIMITS = {
  name: 100,
  description: 250,
  code: 50_000, // 50KB per snippet
  total: 250_000, // total payload guard
  maxCount: 50,
};

// Tags that are dangerous in tracking-pixel context and rarely needed.
const DISALLOWED_TAGS = ["object", "embed", "form", "base", "applet"];

// Inline-event attributes are easy XSS vectors when authors paste 3rd-party
// markup. <script> bodies execute regardless, so banning on* outside <script>
// adds defense without breaking analytics.
const EVENT_ATTR_RE = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

const stripScripts = (html: string) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

export const validateSnippet = (input: SnippetInput): SnippetValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let code = (input.code ?? "").trim();

  if (!input.name?.trim()) errors.push("Name is required.");
  if (input.name && input.name.length > SNIPPET_LIMITS.name)
    errors.push(`Name must be ≤ ${SNIPPET_LIMITS.name} characters.`);
  if ((input.description?.length ?? 0) > SNIPPET_LIMITS.description)
    errors.push(`Description must be ≤ ${SNIPPET_LIMITS.description} characters.`);

  if (!code) errors.push("Code is required.");
  if (code.length > SNIPPET_LIMITS.code)
    errors.push(`Code exceeds ${SNIPPET_LIMITS.code} characters.`);

  if (!["head", "body_start", "body_end"].includes(input.placement))
    errors.push("Invalid placement.");

  // Disallowed tags
  for (const tag of DISALLOWED_TAGS) {
    const re = new RegExp(`<\\s*${tag}\\b`, "i");
    if (re.test(code)) errors.push(`Tag <${tag}> is not allowed.`);
  }

  // javascript:/vbscript: URLs in attributes (outside <script> bodies)
  const outsideScripts = stripScripts(code);
  if (/\b(href|src|action|formaction|xlink:href)\s*=\s*['"]?\s*(javascript|vbscript|data:text\/html)/i.test(outsideScripts)) {
    errors.push("javascript:, vbscript:, and data:text/html URLs are blocked.");
  }

  // Inline event handlers outside <script>
  if (EVENT_ATTR_RE.test(outsideScripts)) {
    warnings.push("Inline event handlers (onclick, onerror, …) detected outside <script>; they were removed.");
    code = code.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>|(<[^>]+>)/gi,
      (match, tag) => (tag ? tag.replace(EVENT_ATTR_RE, "") : match)
    );
  }

  // Unbalanced <script>
  const openScripts = (code.match(/<script\b/gi) ?? []).length;
  const closeScripts = (code.match(/<\/script>/gi) ?? []).length;
  if (openScripts !== closeScripts) {
    errors.push("Unbalanced <script> tags — the page will break.");
  }

  // Reasonable head-only checks
  if (input.placement === "head") {
    if (/<\s*(div|section|main|article|nav|footer|header)\b/i.test(code)) {
      warnings.push("Block-level HTML inside <head> is invalid; consider body placement.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedCode: code,
  };
};

export const validateSnippetList = (raw: unknown): { valid: boolean; error?: string } => {
  if (!Array.isArray(raw)) return { valid: false, error: "Snippets must be an array." };
  if (raw.length > SNIPPET_LIMITS.maxCount)
    return { valid: false, error: `Too many snippets (max ${SNIPPET_LIMITS.maxCount}).` };
  const serialized = JSON.stringify(raw);
  if (serialized.length > SNIPPET_LIMITS.total)
    return { valid: false, error: "Total snippet payload too large." };
  for (const item of raw as any[]) {
    if (!item || typeof item !== "object") return { valid: false, error: "Invalid snippet entry." };
    const r = validateSnippet({
      name: String(item.name ?? ""),
      code: String(item.code ?? ""),
      placement: item.placement,
      description: item.description,
    });
    if (!r.valid) return { valid: false, error: `${item.name || "Snippet"}: ${r.errors[0]}` };
  }
  return { valid: true };
};

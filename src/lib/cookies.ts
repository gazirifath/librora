// Cookie utility for persistent user preferences
const COOKIE_PREFIX = "librora_";

export const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_PREFIX}${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const removeCookie = (name: string) => {
  document.cookie = `${COOKIE_PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Track returning visitors for personalized experience
export const isReturningVisitor = (): boolean => {
  const visited = getCookie("visited");
  if (!visited) {
    setCookie("visited", "1");
    return false;
  }
  return true;
};

// Remember last category browsed
export const setLastCategory = (slug: string) => setCookie("last_cat", slug, 30);
export const getLastCategory = (): string | null => getCookie("last_cat");

// Cookie consent
export const hasConsentedCookies = (): boolean => getCookie("consent") === "1";
export const setConsentCookies = () => setCookie("consent", "1", 365);

// Dismiss newsletter banner
export const hasDismissedNewsletter = (): boolean => getCookie("nl_dismiss") === "1";
export const setDismissedNewsletter = () => setCookie("nl_dismiss", "1", 30);

// Search history (last 5 queries)
export const getSearchHistory = (): string[] => {
  const raw = getCookie("search_hist");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

export const addSearchHistory = (query: string) => {
  const hist = getSearchHistory().filter(q => q !== query);
  hist.unshift(query);
  setCookie("search_hist", JSON.stringify(hist.slice(0, 5)), 30);
};

// Cookie utility for persistent user preferences
const COOKIE_PREFIX = "librora_";

const storageKey = (name: string) => `${COOKIE_PREFIX}${name}`;

const safeLocalStorageGet = (key: string): string | null => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};

const safeLocalStorageSet = (key: string, value: string) => {
  try { window.localStorage.setItem(key, value); } catch {}
};

export const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax${secure}`;
};

export const getCookie = (name: string): string | null => {
  const fullName = `${COOKIE_PREFIX}${name}=`;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(fullName)) {
      return decodeURIComponent(cookie.substring(fullName.length));
    }
  }
  return null;
};

export const removeCookie = (name: string) => {
  document.cookie = `${COOKIE_PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Track returning visitors
export const isReturningVisitor = (): boolean => {
  const visited = getCookie("visited");
  if (!visited) { setCookie("visited", "1"); return false; }
  return true;
};

// Remember last category browsed
export const setLastCategory = (slug: string) => setCookie("last_cat", slug, 30);
export const getLastCategory = (): string | null => getCookie("last_cat");

// Cookie consent (mirrored to localStorage for embedded previews)
export const hasConsentedCookies = (): boolean =>
  safeLocalStorageGet(storageKey("consent")) === "1" || getCookie("consent") === "1";

export const setConsentCookies = () => {
  safeLocalStorageSet(storageKey("consent"), "1");
  setCookie("consent", "1", 365);
};

export const revokeConsentCookies = () => {
  try { window.localStorage.removeItem(storageKey("consent")); } catch {}
  removeCookie("consent");
};

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
  const hist = getSearchHistory().filter((q) => q !== query);
  hist.unshift(query);
  setCookie("search_hist", JSON.stringify(hist.slice(0, 5)), 30);
};

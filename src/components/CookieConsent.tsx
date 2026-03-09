import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { hasConsentedCookies, setConsentCookies, revokeConsentCookies } from "@/lib/cookies";

const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consented = hasConsentedCookies();
    setHasConsented(consented);
    if (!consented) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setHasConsented(hasConsentedCookies());
      setShow(true);
    };
    window.addEventListener("open-cookie-preferences", handler);
    return () => window.removeEventListener("open-cookie-preferences", handler);
  }, []);

  if (!show) return null;

  const accept = () => {
    setConsentCookies();
    setHasConsented(true);
    setShow(false);
  };

  const revoke = () => {
    revokeConsentCookies();
    setHasConsented(false);
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-slide-up">
      <div className="container max-w-2xl">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/95 backdrop-blur-lg px-5 py-4 shadow-book">
          <Cookie className="h-5 w-5 text-accent flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            We use cookies to enhance your browsing experience, remember your preferences, and improve site performance.{" "}
            <a href="/cookie-policy" className="text-primary hover:underline">Learn more</a>
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasConsented ? (
              <button
                onClick={revoke}
                className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Revoke
              </button>
            ) : (
              <button
                onClick={accept}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
            )}
            <button
              onClick={() => setShow(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

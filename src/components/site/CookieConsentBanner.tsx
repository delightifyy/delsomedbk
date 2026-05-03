import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "carehub-cookie-consent";

type ConsentState = "accepted" | "rejected" | null;

export const CookieConsentBanner = () => {
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
  }, []);

  const saveConsent = (value: Exclude<ConsentState, null>) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
  };

  if (consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="container py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-1">
            <p className="font-display text-sm font-semibold text-foreground">We use cookies</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use essential cookies and similar storage to keep the site working and remember your preferences. Optional cookies will only be enabled with your choice. See our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for details.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
            <Button type="button" variant="outline" onClick={() => saveConsent("rejected")}>
              Reject
            </Button>
            <Button type="button" variant="hero" onClick={() => saveConsent("accepted")}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
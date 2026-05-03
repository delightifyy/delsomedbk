import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HeartPulse, Stethoscope, ArrowRight } from "lucide-react";

const PANELS = {
  patients: {
    eyebrow: "For patients",
    icon: HeartPulse,
    title: "Care that meets you where you are.",
    desc: "Search a directory of verified doctors, filter by specialty and state, and reach out — all without paying a kobo to use DesolMed.",
    bullets: [
      "100% free patient accounts",
      "Search by specialty, state and city",
      "Only manually verified doctors",
      "Mobile-first, fast on any network",
    ],
    cta: { label: "Create patient account", to: "/register/patient" },
  },
  doctors: {
    eyebrow: "For doctors",
    icon: Stethoscope,
    title: "A modern home for your practice.",
    desc: "Showcase your credentials, reach patients across Nigeria, and get discovered by HMOs looking to expand their network.",
    bullets: [
      "Reach patients in 36 states",
      "Verified badge on your profile",
      "Get discovered by HMOs",
      "Simple onboarding with document upload",
    ],
    cta: { label: "Apply to join", to: "/register?type=doctor" },
  },
};

export const AudienceTabs = () => {
  const [tab, setTab] = useState<"patients" | "doctors">("patients");
  const panel = PANELS[tab];
  const Icon = panel.icon;

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="flex border-b border-border">
        {(["patients", "doctors"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-6 py-4 text-sm font-medium font-display capitalize transition-colors relative ${
              tab === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For {key}
            {tab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-0">
        <div className="lg:col-span-3 p-8 sm:p-12">
          <div className="flex items-center gap-2 text-secondary text-xs font-medium tracking-wider mb-4">
            <Icon className="h-4 w-4" /> {panel.eyebrow}
          </div>
          <h3 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{panel.title}</h3>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg">{panel.desc}</p>
          <Button asChild size="lg" variant="hero" className="mt-6">
            <Link to={panel.cta.to}>
              {panel.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="lg:col-span-2 bg-muted/40 border-t lg:border-t-0 lg:border-l border-border p-8 sm:p-12">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-5">What You Get</p>
          <ul className="space-y-4">
            {panel.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

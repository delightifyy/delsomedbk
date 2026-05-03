import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, Stethoscope } from "lucide-react";

export const DualCta = () => (
  <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-border shadow-elegant">
    <Link
      to="/register/patient"
      className="group relative bg-card p-8 sm:p-12 lg:p-14 hover:bg-primary-soft transition-colors"
    >
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-secondary">
        <HeartPulse className="h-4 w-4" /> I'm a Patient
      </div>
      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-tight">
        Find a trusted doctor in minutes.
      </h3>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-sm">
        Free account. Verified doctors only. Start exploring the directory.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary group-hover:gap-3 transition-all">
        Create Patient Account <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
    <Link
      to="/register?type=doctor"
      className="group relative gradient-hero text-primary-foreground p-8 sm:p-12 lg:p-14"
    >
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-secondary-foreground/90">
        <Stethoscope className="h-4 w-4" /> I'm a Doctor
      </div>
      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-tight">
        Grow your practice with DesolMed.
      </h3>
      <p className="mt-3 text-sm sm:text-base text-primary-foreground/80 max-w-sm">
        Reach patients across 36 states. Get discovered by HMOs and organizations.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
        Apply to Join <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  </div>
);

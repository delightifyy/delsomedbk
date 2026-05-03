import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SPECIALTIES } from "@/data/doctors";

const STATES = ["North East", "North West", "South East", "South South", "South West"];

export const MegaMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
      >
        Find a Doctor
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[560px] max-w-[90vw] rounded-2xl bg-card border border-border shadow-elegant p-6 z-50 animate-fade-in">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">Top Specialties</p>
              <ul className="space-y-2">
                {SPECIALTIES.slice(0, 6).map((s) => (
                  <li key={s}>
                    <Link
                      to="/doctors"
                      onClick={() => setOpen(false)}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">By Zones</p>
              <ul className="space-y-2">
                {STATES.slice(0, 6).map((s) => (
                  <li key={s}>
                    <Link
                      to="/doctors"
                      onClick={() => setOpen(false)}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Verified Doctors Across 36 States</p>
            <Link
              to="/doctors"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:text-secondary inline-flex items-center gap-1"
            >
              Browse Full Directory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

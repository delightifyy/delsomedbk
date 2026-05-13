import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

export const MegaMenu = () => {
  const [open, setOpen] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadLookups = async () => {
      try {
        const [specialtyResponse, zoneResponse] = await Promise.all([
          api.lookups.specialties(),
          api.lookups.zones(),
        ]);
        if (!cancelled) {
          setSpecialties(collection(specialtyResponse.data).map((entry: any) => String(entry?.name ?? entry?.title ?? "")).filter(Boolean).slice(0, 6));
          setZones(collection(zoneResponse.data).map((entry: any) => String(entry?.name ?? entry?.code ?? "")).filter(Boolean).slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setSpecialties([]);
          setZones([]);
        }
      }
    };
    loadLookups();
    return () => {
      cancelled = true;
    };
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
                {specialties.map((s) => (
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
                {zones.map((s) => (
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
            <p className="text-xs text-muted-foreground">Verified doctors</p>
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

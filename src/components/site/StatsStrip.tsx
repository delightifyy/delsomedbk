import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

type Stat = {
  value: string;
  label: string;
};

export const StatsStrip = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      setLoading(true);
      try {
        const [doctors, states, partners] = await Promise.all([
          api.doctors.list({ per_page: 1 }),
          api.lookups.states(),
          api.cms.partners(),
        ]);
        const next = [
          { value: String(doctors.meta?.total ?? collection(doctors.data).length), label: "Doctors listed" },
          { value: String(collection(states.data).length), label: "States covered" },
          { value: String(collection(partners.data).length), label: "Partners" },
        ].filter((item) => item.value !== "0");
        if (!cancelled) setStats(next);
      } catch {
        if (!cancelled) setStats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-primary text-primary-foreground">
        <div className="container py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-primary-foreground/15">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center md:px-6 first:md:pl-0 last:md:pr-0">
              <Skeleton className="mx-auto h-9 w-24 bg-primary-foreground/20" />
              <Skeleton className="mx-auto mt-3 h-3 w-32 bg-primary-foreground/20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-primary-foreground/15">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:px-6 first:md:pl-0 last:md:pr-0">
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{s.value}</p>
            <p className="mt-1 text-[10px] sm:text-xs tracking-[0.15em] text-primary-foreground/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

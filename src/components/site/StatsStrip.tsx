const stats = [
  { value: "36", label: "States covered" },
  { value: "24/7", label: "Helpline support" },
  { value: "100%", label: "Verified network" },
];

export const StatsStrip = () => (
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

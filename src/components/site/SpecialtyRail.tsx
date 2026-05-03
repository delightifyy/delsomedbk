import { Link } from "react-router-dom";
import { SPECIALTY_CHIPS } from "@/data/specialties";

export const SpecialtyRail = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {SPECIALTY_CHIPS.map((s) => (
      <Link
        key={s.name}
        to="/doctors"
        className="group flex items-center gap-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-card px-5 py-4 transition-all"
      >
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors flex-shrink-0">
          <s.icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold truncate">{s.name}</span>
          <span className="block text-xs text-muted-foreground">{s.count} doctors</span>
        </span>
      </Link>
    ))}
  </div>
);

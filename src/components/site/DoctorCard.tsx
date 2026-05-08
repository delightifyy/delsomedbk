import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import type { Doctor } from "@/data/doctors";
import { Link } from "react-router-dom";

export const DoctorCard = ({ doctor, featured = false }: { doctor: Doctor; featured?: boolean }) => {
  return (
    <article
      className={`group relative bg-card border border-border rounded-2xl p-4 sm:p-6 hover:border-secondary/60 hover:shadow-card transition-all flex flex-col h-full ${
        featured ? "lg:p-8" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <span
            className={`grid place-items-center rounded-xl bg-primary-soft text-primary font-display font-bold flex-shrink-0 ${
              featured ? "h-16 w-16 text-xl" : "h-11 w-11 sm:h-12 sm:w-12 text-sm sm:text-base"
            }`}
          >
            {doctor.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display font-semibold leading-tight truncate ${
                featured ? "text-xl" : "text-[15px] sm:text-base"
              }`}
            >
              {doctor.name}
            </h3>
            <p className="text-xs sm:text-sm text-secondary font-medium mt-0.5 truncate">
              {doctor.specialty}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-secondary bg-secondary/10 px-2 py-1 rounded-full flex-shrink-0">
          <ShieldCheck className="h-3 w-3" />
          <span className="hidden sm:inline">Verified</span>
        </span>
      </div>

      {featured && (
        <p className="mt-5 text-sm text-muted-foreground leading-relaxed line-clamp-3">{doctor.bio}</p>
      )}

      <dl className="mt-auto pt-4 sm:pt-5 border-t border-border grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <dt className="text-muted-foreground tracking-wider text-[10px]">Location</dt>
          <dd className="mt-1 flex items-center gap-1 font-medium truncate">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{doctor.city}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground tracking-wider text-[10px]">Experience</dt>
          <dd className="mt-1 font-medium truncate">{doctor.yearsExperience} years</dd>
        </div>
      </dl>

      <Button asChild variant="soft" size="sm" className="w-full mt-5">
        <Link to={`/doctor-portal?doctor=${doctor.id}`}>
          Doctor Website <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
};

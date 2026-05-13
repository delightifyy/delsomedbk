import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { api } from "@/lib/api";
import { collection, doctorFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";
import { SPECIALTIES } from "@/data/doctors";

type SpecialtyItem = {
  id: string;
  name: string;
  slug: string;
  doctors_count?: number;
};

const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const doctorCountsBySpecialty = (entries: any[]) => {
  const counts = new Map<string, number>();
  entries.forEach((entry, index) => {
    const doctor = doctorFromApi(entry, index);
    const keys = [
      doctor.specialty,
      entry?.specialty,
      entry?.specialty_name,
      entry?.primary_specialty,
      entry?.specialty?.name,
      entry?.specialty?.slug,
      entry?.doctor_profile?.specialty,
      entry?.doctor_profile?.specialty_name,
    ]
      .map(normalizeKey)
      .filter(Boolean);

    Array.from(new Set(keys)).forEach((key) => {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  return counts;
};

const registrationSpecialties: SpecialtyItem[] = SPECIALTIES
  .filter((name) => name !== "Others")
  .map((name) => ({
    id: normalizeKey(name),
    name,
    slug: name,
    doctors_count: 0,
  }));

const withDoctorCounts = (specialties: SpecialtyItem[], doctors: any[]) => {
  const counts = doctorCountsBySpecialty(doctors);
  return specialties.map((specialty) => {
    const counted = [specialty.name, specialty.slug, specialty.id]
      .map(normalizeKey)
      .map((key) => counts.get(key))
      .find((count) => count !== undefined);

    return {
      ...specialty,
      doctors_count: counted ?? specialty.doctors_count ?? 0,
    };
  });
};

export const SpecialtyRail = () => {
  const [items, setItems] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadSpecialties = async () => {
      setLoading(true);
      try {
        const doctorsResponse = await api.doctors.list({ per_page: 500 });
        const mapped = withDoctorCounts(registrationSpecialties, collection(doctorsResponse.data));
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadSpecialties();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: registrationSpecialties.length }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <span className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28 max-w-full" />
              <Skeleton className="h-3 w-20" />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No specialties are available yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((s) => (
        <Link
          key={s.id}
          to={s.slug ? `/doctors?specialty=${encodeURIComponent(s.name)}` : "/doctors"}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-card px-5 py-4 transition-all"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors flex-shrink-0">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-sm font-semibold truncate">{s.name}</span>
            <span className="block text-xs text-muted-foreground">
              {Number.isFinite(Number(s.doctors_count)) ? Number(s.doctors_count) : 0}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
};

import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import { type Doctor } from "@/data/doctors";
import { DoctorCard } from "@/components/site/DoctorCard";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Search, LayoutGrid, Rows3, X, SlidersHorizontal } from "lucide-react";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { collection, doctorFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

const ALL = "all";
const PAGE_SIZE = 6;

const Doctors = () => {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [spec, setSpec] = useState(ALL);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupSpecialties, setLookupSpecialties] = useState<string[]>([]);
  const [lookupZones, setLookupZones] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const [response, specialtyResponse, zoneResponse] = await Promise.all([
          api.doctors.list({ per_page: 60 }),
          api.lookups.specialties(),
          api.lookups.zones(),
        ]);
        const mapped = collection(response.data).map((entry, index) => doctorFromApi(entry, index));
        if (!cancelled) {
          setDoctors(mapped);
          setLookupSpecialties(collection(specialtyResponse.data).map((entry: any) => String(entry?.name ?? entry?.title ?? "")).filter(Boolean));
          setLookupZones(collection(zoneResponse.data).map((entry: any) => String(entry?.name ?? entry?.code ?? "")).filter(Boolean));
        }
      } catch {
        if (!cancelled) {
          setDoctors([]);
          setLookupSpecialties([]);
          setLookupZones([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  const states = useMemo(() => Array.from(new Set(doctors.map((d) => d.state).filter(Boolean))).sort(), [doctors]);
  const cities = useMemo(() => Array.from(new Set(doctors.map((d) => d.city).filter(Boolean))).sort(), [doctors]);
  const specialties = useMemo(
    () => Array.from(new Set([...lookupSpecialties, ...doctors.map((d) => d.specialty)].filter(Boolean))).sort(),
    [doctors, lookupSpecialties]
  );
  const zones = useMemo(
    () => Array.from(new Set([...lookupZones, ...doctors.map((d) => d.zone)].filter(Boolean))).sort(),
    [doctors, lookupZones]
  );

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (zone !== ALL && d.zone !== zone) return false;
      if (state !== ALL && d.state !== state) return false;
      if (city !== ALL && d.city !== city) return false;
      if (spec !== ALL && d.specialty !== spec) return false;
      if (q && !`${d.name} ${d.specialty} ${d.city}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [doctors, q, zone, state, city, spec]);

  // Reset to first page when filters change
  useEffect(() => { setPage(1); }, [q, zone, state, city, spec]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reset = () => {
    setQ(""); setZone(ALL); setState(ALL); setCity(ALL); setSpec(ALL);
  };

  const activeFilters = [zone, state, city, spec].filter((v) => v !== ALL).length + (q ? 1 : 0);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const DoctorGridSkeleton = (
    <div
      className={
        density === "comfortable"
          ? "grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 items-stretch"
          : "grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
      }
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // Build a compact page list with ellipses
  const pageItems: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageItems.push(i);
  } else {
    pageItems.push(1);
    if (currentPage > 3) pageItems.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pageItems.push(i);
    if (currentPage < totalPages - 2) pageItems.push("ellipsis");
    pageItems.push(totalPages);
  }

  const FilterFields = (
    <>
      <div className="space-y-2">
        <Label className="text-xs tracking-wider text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, specialty…" className="pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-wider text-muted-foreground">Specialty</Label>
        <Select value={spec} onValueChange={setSpec}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Specialties</SelectItem>
            {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-wider text-muted-foreground">Zone</Label>
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Zones</SelectItem>
            {zones.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-wider text-muted-foreground">State</Label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All States</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs tracking-wider text-muted-foreground">City</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container py-10 sm:py-12 max-w-3xl">
          <SectionLabel number="" label="Doctors Directory" />
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
            Find a Verified Doctor.
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">
            Browse our network of manually verified doctors. Filter by location and specialty to find the right fit.
          </p>
        </div>
      </section>

      <section className="container py-8 sm:py-10 grid lg:grid-cols-12 gap-8">
        {/* Sticky filter sidebar (desktop only) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="lg:sticky lg:top-32 space-y-5 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold tracking-wider">Filters</h2>
              {activeFilters > 0 && (
                <button onClick={reset} className="text-xs text-secondary font-medium inline-flex items-center gap-1 hover:underline">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            {FilterFields}
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          {/* Mobile toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
            {loading ? (
              <Skeleton className="h-4 w-36" />
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span>
                <span className="hidden sm:inline"> of {doctors.length}</span> Doctors
              </p>
            )}
            <div className="flex items-center gap-2">
              {/* Filters button – mobile only */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden h-9 relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="ml-1.5">Filters</span>
                    {activeFilters > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 text-[10px] font-bold rounded-full bg-secondary text-secondary-foreground">
                        {activeFilters}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
                  <SheetHeader className="text-left">
                    <SheetTitle className="font-display">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-5 py-4">{FilterFields}</div>
                  <SheetFooter className="flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={reset} className="flex-1">
                      Clear All
                    </Button>
                    <SheetClose asChild>
                      <Button variant="hero" size="sm" className="flex-1">
                        Show {filtered.length} Results
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
                <Button
                  variant={density === "comfortable" ? "soft" : "ghost"}
                  size="sm"
                  onClick={() => setDensity("comfortable")}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={density === "compact" ? "soft" : "ghost"}
                  size="sm"
                  onClick={() => setDensity("compact")}
                  className="h-8 px-2"
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            DoctorGridSkeleton
          ) : filtered.length > 0 ? (
            <>
              <div
                className={
                  density === "comfortable"
                    ? "grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 items-stretch"
                    : "grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
                }
              >
                {paged.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); goTo(currentPage - 1); }}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {pageItems.map((item, idx) => (
                        <PaginationItem key={`${item}-${idx}`}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={item === currentPage}
                              onClick={(e) => { e.preventDefault(); goTo(item); }}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); goTo(currentPage + 1); }}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 sm:py-20 px-4 rounded-2xl border border-dashed border-border">
              <p className="font-display text-lg font-semibold">No Doctors Match Your Filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try clearing some filters or searching a wider area.</p>
              <Button onClick={reset} variant="soft" size="sm" className="mt-4">Clear Filters</Button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Doctors;

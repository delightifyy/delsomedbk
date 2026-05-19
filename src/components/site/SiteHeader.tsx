import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ChevronDown, Stethoscope, Building2, Pill, FlaskConical } from "lucide-react";
import desolmedLogo from "@/assets/desolmed-logo.png";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { collection, doctorFromApi } from "@/lib/backendAdapters";
import { type Doctor } from "@/data/doctors";

const REGISTER_OPTIONS = [
  { to: "/register?type=doctor", label: "Doctor", icon: Stethoscope, blurb: "Join as a clinician" },
  { to: "/register?type=organization", label: "HMO / Organization", icon: Building2, blurb: "HMOs, hospitals, NGOs" },
  { to: "/register?type=pharmacy", label: "Pharmacy", icon: Pill, blurb: "Community & chain pharmacies" },
  { to: "/register?type=lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical, blurb: "Labs & diagnostic centres" },
];

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/adverts", label: "Health Adverts" },
  { to: "/health-news", label: "News" },
  { to: "/contact", label: "Contact Us" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const loadSearchData = async () => {
      try {
        const [doctorResponse, specialtyResponse] = await Promise.all([
          api.doctors.list({ per_page: 5 }),
          api.lookups.specialties(),
        ]);
        if (!cancelled) {
          setDoctors(collection(doctorResponse.data).map((entry, index) => doctorFromApi(entry, index)).slice(0, 5));
          setSpecialties(collection(specialtyResponse.data).map((entry: any) => String(entry?.name ?? entry?.title ?? "")).filter(Boolean).slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setDoctors([]);
          setSpecialties([]);
        }
      }
    };
    loadSearchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const go = (to: string) => {
    setCmd(false);
    navigate(to);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={desolmedLogo} alt="DesolMed logo" className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-sm" />
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-none">
              <span className="text-primary">Desol</span><span className="text-secondary">Med</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <RouterNavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "text-primary bg-primary-soft" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              Home
            </RouterNavLink>
            <RouterNavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "text-primary bg-primary-soft" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              About Us
            </RouterNavLink>
            <MegaMenu />
            {links.slice(2).map((l) => (
              <RouterNavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "text-primary bg-primary-soft" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {l.label}
              </RouterNavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCmd(true)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:border-secondary transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <Button asChild size="sm" variant="hero">
              <Link to="/register">Join the network</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/subscription">Subscribe</Link>
            </Button>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container py-3 flex flex-col gap-1">
              <RouterNavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm rounded-md",
                    isActive ? "text-primary bg-primary-soft font-medium" : "text-muted-foreground",
                  )
                }
              >
                Home
              </RouterNavLink>
              <RouterNavLink
                to="/doctors"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm rounded-md",
                    isActive ? "text-primary bg-primary-soft font-medium" : "text-muted-foreground",
                  )
                }
              >
                Find a Doctor
              </RouterNavLink>
              {links.slice(1).map((l) => (
                <RouterNavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 text-sm rounded-md",
                      isActive ? "text-primary bg-primary-soft font-medium" : "text-muted-foreground",
                    )
                  }
                >
                  {l.label}
                </RouterNavLink>
              ))}
              <div className="pt-2 mt-2 border-t border-border space-y-1">
                <p className="px-3 pt-1 pb-1 text-[10px] tracking-wider text-muted-foreground font-semibold">
                  Join the Network
                </p>
                {REGISTER_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <Link
                      key={o.to}
                      to={o.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted"
                    >
                      <Icon className="h-4 w-4 text-secondary" />
                      <span>{o.label}</span>
                    </Link>
                  );
                })}
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link to="/register/patient" onClick={() => setOpen(false)}>
                    I'm a Patient
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <CommandDialog open={cmd} onOpenChange={setCmd}>
        <CommandInput placeholder="Search Doctors, Specialties, Pages…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => go("/doctors")}>Find a Doctor</CommandItem>
            <CommandItem onSelect={() => go("/about")}>About DesolMed</CommandItem>
            <CommandItem onSelect={() => go("/contact")}>Contact</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Specialties">
            {specialties.map((s) => (
              <CommandItem key={s} onSelect={() => go("/doctors")}>
                {s}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Doctors">
            {doctors.map((d) => (
              <CommandItem key={d.id} onSelect={() => go("/doctors")}>
                {d.name} · <span className="text-muted-foreground ml-1">{d.specialty}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

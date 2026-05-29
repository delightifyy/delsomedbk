import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, ShieldCheck, BadgeCheck, Building2, Search, Eye, Mail, Phone } from "lucide-react";
import type { PatientCategory } from "@/hooks/usePatientCategory";

type AdminPatient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: PatientCategory;
  joined: string;
  status: "active" | "suspended";
  detail: string;
};

const PATIENTS: AdminPatient[] = [
  { id: "p1", name: "Adaobi Okeke", email: "adaobi.okeke@example.com", phone: "+234 803 555 0188", category: "hmo", joined: "2025-08-12", status: "active", detail: "AXA Mansard HMO · Gold Family Plan · POL-NG-77419-A" },
  { id: "p2", name: "Tunde Bakare", email: "tunde.bakare@example.com", phone: "+234 805 220 1144", category: "card", joined: "2026-01-04", status: "active", detail: "Pay-per-consultation · 2 saved cards" },
  { id: "p3", name: "Ngozi Eze", email: "ngozi.eze@example.com", phone: "+234 802 998 7711", category: "subscription", joined: "2025-11-20", status: "active", detail: "DesolMed Plus · Renews 2026-06-01" },
  { id: "p4", name: "Yusuf Lawal", email: "yusuf.lawal@sterlingbank.ng", phone: "+234 809 451 0233", category: "organization", joined: "2025-03-09", status: "active", detail: "Sterling Bank Nigeria · Tier 2 — Premium" },
  { id: "p5", name: "Blessing Okafor", email: "blessing.okafor@example.com", phone: "+234 813 770 5566", category: "hmo", joined: "2024-12-15", status: "suspended", detail: "Hygeia HMO · Silver Plan · POL-NG-44102-B" },
  { id: "p6", name: "Samuel Idris", email: "samuel.idris@example.com", phone: "+234 807 224 9981", category: "card", joined: "2026-02-18", status: "active", detail: "Pay-per-consultation · 1 saved card" },
  { id: "p7", name: "Funmi Adebayo", email: "funmi.adebayo@example.com", phone: "+234 814 119 4422", category: "subscription", joined: "2025-09-30", status: "active", detail: "DesolMed Family · Renews 2026-09-30" },
  { id: "p8", name: "Ibrahim Musa", email: "ibrahim.musa@accessbank.ng", phone: "+234 818 332 7700", category: "organization", joined: "2024-07-22", status: "active", detail: "Access Bank · Tier 1 — Standard" },
];

const CATEGORY_META: Record<PatientCategory | "all", { label: string; icon: typeof CreditCard }> = {
  all: { label: "All Patients", icon: Search },
  card: { label: "Card Payment", icon: CreditCard },
  hmo: { label: "Card", icon: ShieldCheck },
  subscription: { label: "Subscription", icon: BadgeCheck },
  organization: { label: "Organization", icon: Building2 },
};

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";

const Patients = () => {
  const [tab, setTab] = useState<PatientCategory | "all">("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<AdminPatient | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PATIENTS.length, card: 0, hmo: 0, subscription: 0, organization: 0 };
    PATIENTS.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PATIENTS.filter((p) => {
      if (tab !== "all" && p.category !== tab) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.email.toLowerCase().includes(needle) ||
        p.phone.toLowerCase().includes(needle)
      );
    });
  }, [tab, q]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Manage patients across Card, Subscription and Organization payment categories.
          </p>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["card", "hmo", "subscription", "organization"] as PatientCategory[]).map((k) => {
          const Icon = CATEGORY_META[k].icon;
          return (
            <Card key={k} className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{CATEGORY_META[k].label}</p>
                <p className="font-display text-xl font-bold leading-none mt-1">{counts[k] || 0}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as PatientCategory | "all")} className="mt-5">
        <TabsList className="flex flex-wrap h-auto">
          {(["all", "card", "hmo", "subscription", "organization"] as const).map((k) => (
            <TabsTrigger key={k} value={k}>
              {CATEGORY_META[k].label} ({counts[k] || 0})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="mt-4 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No patients match this filter.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((p) => {
              const Icon = CATEGORY_META[p.category].icon;
              return (
                <li key={p.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{p.name}</p>
                        <Badge variant="outline" className="capitalize gap-1">
                          <Icon className="h-3 w-3" />
                          {CATEGORY_META[p.category].label}
                        </Badge>
                        <Badge variant={p.status === "active" ? "default" : "secondary"} className="capitalize">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{p.detail}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:ml-auto">
                    <Button size="sm" variant="outline" onClick={() => setActive(p)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.name}</DialogTitle>
                <DialogDescription>
                  {CATEGORY_META[active.category].label} patient · joined {new Date(active.joined).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{active.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{active.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{CATEGORY_META[active.category].label}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{active.status}</span></div>
                <div className="pt-3 border-t border-border/60">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Coverage details</p>
                  <p>{active.detail}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Patients;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Users as UsersIcon, HeartPulse, Stethoscope, Building2, Pill, FlaskConical, Mail, Phone, Calendar, Eye, ShieldCheck, MapPin, Ban, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DOCTORS } from "@/data/doctors";
import { listProfiles, listUserRoles, setUserRole, subscribeStore, type LocalProfile, type LocalUserRole } from "@/lib/localStore";

type UserType = "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";
type AppRole = "admin" | "user";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  organization_name: string | null;
  user_type: UserType | null;
  created_at: string;
};

type Row = {
  id: string;
  display: string;
  subtitle?: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  initials: string;
  user_type: UserType | null;
  created_at?: string;
  // doctor-specific
  doctorSlug?: string;
  // role management — only for real profiles
  manageable: boolean;
  role?: AppRole;
};

type TabKey = "all" | "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "all", label: "All users", icon: UsersIcon },
  { key: "patient", label: "Patients", icon: HeartPulse },
  { key: "doctor", label: "Doctors", icon: Stethoscope },
  { key: "organization", label: "HMO / Organization", icon: Building2 },
  { key: "pharmacy", label: "Pharmacy", icon: Pill },
  { key: "lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical },
];

const typeLabel: Record<UserType, string> = {
  patient: "Patient",
  doctor: "Doctor",
  organization: "HMO' / Organization",
  pharmacy: "Pharmacy",
  "lab-diagnostics": "Laboratory / Diagnostics",
};

const typeTone: Record<UserType, string> = {
  patient: "bg-primary-soft text-primary",
  doctor: "bg-secondary text-secondary-foreground",
  organization: "bg-accent text-accent-foreground",
  pharmacy: "bg-accent text-accent-foreground",
  "lab-diagnostics": "bg-accent text-accent-foreground",
};

const initialsOf = (name: string) => {
  const src = (name || "?").trim();
  return src.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
};

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

type SampleUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User" | "Doctor" | "Patient" | "Pharmacy";
  status: "Active" | "Suspended";
};

const INITIAL_SAMPLE_USERS: SampleUser[] = [
  { id: "u1", name: "Adaeze Okafor", email: "adaeze.okafor@example.com", role: "Admin", status: "Active" },
  { id: "u2", name: "Dr. Tunde Bello", email: "tunde.bello@example.com", role: "Doctor", status: "Active" },
  { id: "u3", name: "Chinwe Eze", email: "chinwe.eze@example.com", role: "Patient", status: "Active" },
  { id: "u4", name: "MedPlus Pharmacy", email: "contact@medplus.example.com", role: "Pharmacy", status: "Suspended" },
  { id: "u5", name: "Ibrahim Musa", email: "ibrahim.musa@example.com", role: "User", status: "Active" },
  { id: "u6", name: "Dr. Funke Adeyemi", email: "funke.adeyemi@example.com", role: "Doctor", status: "Suspended" },
];

const UsersPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole>>({});
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sampleUsers, setSampleUsers] = useState<SampleUser[]>(INITIAL_SAMPLE_USERS);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => { setPage(1); }, [tab, q]);

  const load = async () => {
    setLoading(true);
    const pData = listProfiles();
    const rData = listUserRoles();
    setProfiles(pData as LocalProfile[]);
    const map: Record<string, AppRole> = {};
    (rData ?? []).forEach((r: LocalUserRole) => {
      // admin wins over user
      if (map[r.user_id] !== "admin") map[r.user_id] = r.role as AppRole;
    });
    setRoles(map);
    setLoading(false);
  };

  useEffect(() => subscribeStore(() => { load(); }), []);

  // Build a unified row list. Doctors tab merges static DOCTORS samples + real doctor profiles.
  const profileRows: Row[] = useMemo(() =>
    profiles.map((p) => {
      const display = p.organization_name || p.full_name || p.email || "Unnamed user";
      return {
        id: p.id,
        display,
        email: p.email,
        phone: p.phone,
        avatar_url: p.avatar_url,
        initials: initialsOf(p.full_name || display),
        user_type: p.user_type,
        created_at: p.created_at,
        manageable: true,
        role: roles[p.id] ?? "user",
      } as Row;
    }), [profiles, roles]);

  const allRows: Row[] = profileRows;

  // Sample doctors — only used for the Doctors tab
  const sampleDoctorRows: Row[] = useMemo(
    () =>
      DOCTORS.map((d) => ({
        id: `sample:${d.id}`,
        display: d.name,
        subtitle: `${d.specialty} · ${d.city}, ${d.state}`,
        email: undefined,
        phone: undefined,
        avatar_url: null,
        initials: d.initials,
        user_type: "doctor" as UserType,
        doctorSlug: d.id,
        manageable: false,
      })),
    []
  );

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: allRows.length, patient: 0, doctor: 0, organization: 0, pharmacy: 0, diagnostics: 0, laboratory: 0,
    };
    allRows.forEach((r) => {
      if (r.user_type && c[r.user_type as TabKey] !== undefined) {
        c[r.user_type as TabKey]++;
      }
    });
    // Add sample doctors only to the Doctors tab count
    c.doctor += sampleDoctorRows.length;
    return c;
  }, [allRows, sampleDoctorRows]);

  const filterFor = (key: TabKey) => {
    let list: Row[] = allRows;
    if (key === "doctor") {
      list = [...allRows.filter((r) => r.user_type === "doctor"), ...sampleDoctorRows];
    } else if (key !== "all") {
      list = allRows.filter((r) => r.user_type === key);
    }
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((r) =>
      [r.display, r.subtitle, r.email, r.phone].some((v) => v?.toLowerCase().includes(needle))
    );
  };

  const setUserRole = async (userId: string, next: AppRole) => {
    const prev = roles[userId] ?? "user";
    if (prev === next) return;
    setSavingId(userId);
    // Optimistic
    setRoles((r) => ({ ...r, [userId]: next }));
    try {
      // Remove the opposite role, then upsert the new one (table has unique(user_id, role))
      const opposite: AppRole = next === "admin" ? "user" : "admin";
      await setUserRole(userId, next);
      toast({ title: "Role updated", description: `Set to ${next}.` });
    } catch (e: any) {
      setRoles((r) => ({ ...r, [userId]: prev }));
      toast({ title: "Couldn't update role", description: e.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Patients, doctors and organisations registered on Desol<span className="text-secondary">Med</span>.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-6">
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="flex-col gap-1 h-auto py-2 px-4 whitespace-normal text-center">
              <div className="flex items-center gap-2">
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">({counts[t.key]})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const list = filterFor(t.key);
          const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
          const currentPage = Math.min(page, totalPages);
          const pagedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
          const filteredSample = q.trim()
            ? sampleUsers.filter((u) =>
                [u.name, u.email, u.role, u.status].some((v) => v.toLowerCase().includes(q.toLowerCase()))
              )
            : sampleUsers;
          return (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              {t.key === "all" && (
                <Card className="overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium text-sm">{t.label} — Sample</h3>
                    <span className="text-xs text-muted-foreground">{filteredSample.length} total</span>
                  </div>
                  {filteredSample.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No sample users match your search.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSample.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                              <div className="sm:hidden mt-1">
                                <Badge variant="secondary" className="bg-primary-soft text-primary text-[10px]">{u.role}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary" className="bg-primary-soft text-primary">{u.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  u.status === "Active"
                                    ? "bg-primary/15 text-primary hover:bg-primary/15"
                                    : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                                }
                              >
                                {u.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs [&_svg]:size-3"
                                  onClick={() =>
                                    toast({ title: "Viewing user", description: u.name })
                                  }
                                >
                                  <Eye className="h-3 w-3" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs [&_svg]:size-3"
                                  onClick={() => {
                                    setSampleUsers((prev) =>
                                      prev.map((x) =>
                                        x.id === u.id
                                          ? { ...x, status: x.status === "Active" ? "Suspended" : "Active" }
                                          : x
                                      )
                                    );
                                    toast({
                                      title: u.status === "Active" ? "User suspended" : "User reactivated",
                                      description: u.name,
                                    });
                                  }}
                                >
                                  <Ban className="h-3 w-3" />
                                  <span className="hidden sm:inline">{u.status === "Active" ? "Suspend" : "Activate"}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-xs [&_svg]:size-3"
                                  onClick={() => {
                                    setSampleUsers((prev) => prev.filter((x) => x.id !== u.id));
                                    toast({ title: "User deleted", description: u.name });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              )}
              <Card className="overflow-hidden">
                {loading ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
                ) : list.length === 0 ? (
                  <div className="p-10 text-center">
                    <UsersIcon className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {q ? "No users match your search." : `No ${t.label.toLowerCase()} yet.`}
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-border">
                      {pagedList.map((r) => (
                        <li key={r.id} className="p-4 flex items-center gap-4 flex-wrap">
                          <Avatar className="h-11 w-11">
                            {r.avatar_url ? <AvatarImage src={r.avatar_url} alt="" /> : null}
                            <AvatarFallback className="bg-primary-soft text-primary text-sm font-medium">
                              {r.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{r.display}</p>
                              {r.manageable && r.role === "admin" && (
                                <Badge className="bg-foreground text-background gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Admin
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {r.subtitle && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.subtitle}</span>}
                              {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
                              {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                              {r.created_at && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {fmtDate(r.created_at)}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            {r.manageable ? (
                              <Select
                                value={r.role ?? "user"}
                                onValueChange={(v) => setUserRole(r.id, v as AppRole)}
                                disabled={savingId === r.id}
                              >
                                <SelectTrigger className="h-9 w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : null}

                            {r.user_type === "doctor" && (
                              <Button size="icon" variant="outline" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Page {currentPage} of {totalPages} · {list.length} total
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Prev</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          >
                            <span className="hidden sm:inline mr-1">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </DashboardLayout>
  );
};

export default UsersPage;

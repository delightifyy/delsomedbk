import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Users as UsersIcon,
  HeartPulse,
  Stethoscope,
  Building2,
  Pill,
  FlaskConical,
  Mail,
  Phone,
  Calendar,
  Eye,
  Ban,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DOCTORS } from "@/data/doctors";
import {
  listProfiles,
  listUserRoles,
  setUserRole as setUserRoleInStore,
  subscribeStore,
  ensureDemoUsers,
  type LocalProfile,
  type LocalUserRole,
} from "@/lib/localStore";


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
  manageable: boolean;
  role?: AppRole;
};

type TabKey = "all" | "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const EXCLUDED_USER_EMAILS = new Set(["user@carehub.local"]);

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

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All users", icon: UsersIcon },
  { key: "patient", label: "Patients", icon: HeartPulse },
  { key: "doctor", label: "Doctors", icon: Stethoscope },
  { key: "organization", label: "HMO / Organization", icon: Building2 },
  { key: "pharmacy", label: "Pharmacy", icon: Pill },
  { key: "lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical },
];

const initialsOf = (name: string) => {
  const src = (name || "?").trim();
  return src.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
};

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const UsersPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole>>({});
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sampleUsers, setSampleUsers] = useState<SampleUser[]>(INITIAL_SAMPLE_USERS);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const load = () => {
    setLoading(true);
    const pData = listProfiles();
    const rData = listUserRoles();
    setProfiles(pData as LocalProfile[]);
    const map: Record<string, AppRole> = {};
    (rData ?? []).forEach((r: LocalUserRole) => {
      if (map[r.user_id] !== "admin") map[r.user_id] = r.role as AppRole;
    });
    setRoles(map);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeStore(() => {
      load();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    ensureDemoUsers();
  }, []);

  const profileRows: Row[] = useMemo(
    () =>
      profiles
        .filter((p) => !EXCLUDED_USER_EMAILS.has((p.email ?? "").toLowerCase()))
        .map((p) => {
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
          };
        })
        .filter((row) => row.role !== "admin"),
    [profiles, roles]
  );

  const allRows: Row[] = profileRows;

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
        manageable: false,
      })),
    []
  );

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: allRows.length,
      patient: 0,
      doctor: 0,
      organization: 0,
      pharmacy: 0,
      "lab-diagnostics": 0,
    };
    allRows.forEach((r) => {
      if (r.user_type && c[r.user_type as TabKey] !== undefined) c[r.user_type as TabKey]++;
    });
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
    return list;
  };

  const handleSetUserRole = async (userId: string, next: AppRole) => {
    const prev = roles[userId] ?? "user";
    if (prev === next) return;
    setSavingId(userId);
    setRoles((r) => ({ ...r, [userId]: next }));
    try {
      await setUserRoleInStore(userId, next);
      toast({ title: "Role updated", description: `Set to ${next}.` });
    } catch (e: unknown) {
      setRoles((r) => ({ ...r, [userId]: prev }));
      const description = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Couldn't update role", description, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Patients, doctors and organisations registered on Desol<span className="text-secondary">Med</span>.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <Select value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label} ({counts[t.key]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(() => {
        const currentTab = TABS.find((x) => x.key === tab) ?? TABS[0];
        const list = filterFor(tab);
        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        const currentPage = Math.min(page, totalPages);
        const pagedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
        const filteredSample = sampleUsers;

        return (
          <div className="mt-4 space-y-4">
            {tab === "all" && (
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-medium text-sm">{currentTab.label} — Sample</h3>
                  <span className="text-xs text-muted-foreground">{filteredSample.length} total</span>
                </div>
                {filteredSample.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No sample users match your search.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
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
                                <Badge
                                  variant="secondary"
                                  className={u.status === "Active" ? "bg-success/15 text-success text-[10px]" : "bg-warning/15 text-warning text-[10px]"}
                                >
                                  {u.status}
                                </Badge>
                            </div>
                          </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant="secondary"
                                className={u.status === "Active" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}
                              >
                                {u.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Open actions menu">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast({ title: "Viewing user", description: u.name })}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSampleUsers((prev) =>
                                      prev.map((x) =>
                                        x.id === u.id ? { ...x, status: x.status === "Active" ? "Suspended" : "Active" } : x
                                      )
                                    );
                                    toast({
                                      title: u.status === "Active" ? "User suspended" : "User reactivated",
                                      description: u.name,
                                    });
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {u.status === "Active" ? "Suspend" : "Reactivate"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSampleUsers((prev) => prev.filter((x) => x.id !== u.id));
                                    toast({ title: "User deleted", description: u.name });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            )}

            {loading ? (
              <Card className="overflow-hidden">
                <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
              </Card>
            ) : list.length > 0 ? (
              <Card className="overflow-hidden">
                <>
                  <ul className="divide-y divide-border">
                    {pagedList.map((r) => (
                      <li key={r.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <Avatar className="h-11 w-11 flex-shrink-0">
                            {r.avatar_url ? <AvatarImage src={r.avatar_url} alt="" /> : null}
                            <AvatarFallback className="bg-primary-soft text-primary text-sm font-medium">
                              {r.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{r.display}</p>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {r.subtitle && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.subtitle}</span>}
                              {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
                              {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                              {r.created_at && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {fmtDate(r.created_at)}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-2 lg:ml-auto w-full lg:w-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Open user actions">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast({ title: "Viewing user", description: r.display })}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {r.manageable ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const next = (roles[r.id] ?? "user") === "admin" ? "user" : "admin";
                                    handleSetUserRole(r.id, next);
                                  }}
                                  disabled={savingId === r.id}
                                >
                                  <UsersIcon className="h-4 w-4 mr-2" />
                                  {roles[r.id] === "admin" ? "Set as User" : "Set as Admin"}
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => toast({ title: "Delete action", description: "This action is not connected yet." })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              </Card>
            ) : null}
          </div>
        );
      })()}
    </DashboardLayout>
  );
};

export default UsersPage;

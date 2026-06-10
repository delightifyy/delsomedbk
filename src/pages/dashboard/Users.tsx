import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { collection, userProfileFromApi } from "@/lib/backendAdapters";

type UserType = "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";
type AppRole = "super_admin" | "admin" | "user";
type RawRecord = Record<string, unknown>;

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  organization_name: string | null;
  user_type: UserType | null;
  website_url: string | null;
  created_at: string;
  role?: string;
  status?: string;
  raw?: RawRecord;
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
  organization_name?: string | null;
  website_url?: string | null;
  created_at?: string;
  manageable: boolean;
  role?: AppRole;
  roleLabel?: string;
  status?: string;
  raw?: RawRecord;
};

type TabKey = "all" | "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

const EXCLUDED_USER_EMAILS = new Set(["user@carehub.local"]);
const PAGE_SIZE = 5;

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All users", icon: UsersIcon },
  { key: "patient", label: "Patients", icon: HeartPulse },
  { key: "doctor", label: "Doctors", icon: Stethoscope },
  { key: "organization", label: "HMO / Organization", icon: Building2 },
  { key: "pharmacy", label: "Pharmacy", icon: Pill },
  { key: "lab-diagnostics", label: "Laboratory / Diagnostics", icon: FlaskConical },
];

const HIDDEN_DETAIL_KEYS = new Set([
  "id",
  "uuid",
  "profile",
  "roles",
  "permissions",
  "recent_activity",
  "activity",
  "activities",
  "activity_logs",
  "logs",
  "review_logs",
  "properties",
  "attributes",
  "changes",
  "causer",
  "subject",
  "password",
  "password_confirmation",
  "remember_token",
  "token",
  "access_token",
  "refresh_token",
  "email_verification_token",
  "verification_token",
  "otp",
  "secret",
  "api_key",
  "ip",
  "ip_address",
  "user_agent",
  "deleted_at",
  "created_at",
  "updated_at",
]);

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : {};

const textOf = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(", ");

  const record = asRecord(value);
  return (
    textOf(record.name) ||
    textOf(record.full_name) ||
    textOf(record.title) ||
    textOf(record.label) ||
    textOf(record.slug) ||
    textOf(record.code) ||
    ""
  );
};

const initialsOf = (name: string) => {
  const src = (name || "?").trim();
  return src.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "?";
};

const fmtDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const normalizeRoleText = (role?: string | null) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const roleToAppRole = (role?: string | null): AppRole => {
  const normalized = normalizeRoleText(role);
  if (normalized === "super_admin") return "super_admin";
  if (normalized.includes("admin")) return "admin";
  return "user";
};

const prettyText = (value?: string | null, fallback = "Not provided") => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const prettyKey = (key: string) => prettyText(key);

const isVisibleDetail = ([key, value]: [string, unknown]) => {
  const normalizedKey = key.toLowerCase();
  if (HIDDEN_DETAIL_KEYS.has(normalizedKey)) return false;
  if (/(password|token|secret|otp|ip|agent)/i.test(normalizedKey)) return false;
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(asRecord(value)).length === 0) return false;
  return true;
};

const formatDetailValue = (value: unknown): string => {
  const direct = textOf(value);
  if (direct) return direct;
  if (Array.isArray(value)) return value.map(formatDetailValue).filter(Boolean).join(", ");
  return "";
};

const detailRowsFor = (raw?: RawRecord) => {
  const source = asRecord(raw);
  const profile = asRecord(source.profile);
  const merged = { ...profile, ...source };

  return Object.entries(merged)
    .filter(isVisibleDetail)
    .map(([key, value]) => ({ key, label: prettyKey(key), value: formatDetailValue(value) }))
    .filter((row) => row.value);
};

const rowFromProfile = (profile: Profile, roleOverride?: AppRole): Row => {
  const display = profile.organization_name || profile.full_name || profile.email || "Unnamed user";
  const roleLabel = profile.role || roleOverride || "user";

  return {
    id: profile.id,
    display,
    email: profile.email,
    phone: profile.phone,
    avatar_url: profile.avatar_url,
    initials: initialsOf(profile.full_name || display),
    user_type: profile.user_type,
    organization_name: profile.organization_name,
    website_url: profile.website_url,
    created_at: profile.created_at,
    manageable: true,
    role: roleOverride ?? roleToAppRole(roleLabel),
    roleLabel,
    status: profile.status ?? "active",
    raw: profile.raw,
  };
};

const statusTone = (status?: string) => {
  const normalized = String(status || "active").toLowerCase();
  if (normalized === "suspended") return "bg-warning/15 text-warning";
  if (normalized.includes("pending")) return "bg-muted text-muted-foreground";
  return "bg-success/15 text-success";
};

const isActiveStatus = (status?: string) => String(status || "active").toLowerCase() === "active";

// Skeleton components
const UserCardSkeleton = () => (
  <li className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
    <div className="flex items-start gap-4 min-w-0 flex-1">
      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between lg:justify-end gap-2 lg:ml-auto w-full lg:w-auto">
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </li>
);

const InfoFieldSkeleton = () => (
  <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
    <Skeleton className="h-3 w-16 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
);

const UsersPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole>>({});
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeUser, setActiveUser] = useState<Row | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    let cancelled = false;

    const loadBackend = async () => {
      setLoading(true);
      try {
        const response = await api.admin.users.list({ page: 1 });
        const mapped = collection(response.data).map((entry) => {
          const profile = userProfileFromApi(entry) as Profile;
          return { ...profile, raw: asRecord(entry) };
        });
        const roleMap: Record<string, AppRole> = {};

        mapped.forEach((profile) => {
          roleMap[profile.id] = roleToAppRole(profile.role);
        });

        if (!cancelled) {
          setProfiles(mapped);
          setRoles(roleMap);
        }
      } catch (error) {
        if (!cancelled) {
          setProfiles([]);
          setRoles({});
          toast({
            title: "Couldn't load users",
            description: error instanceof Error ? error.message : "The users endpoint did not respond.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBackend();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const allRows: Row[] = useMemo(
    () =>
      profiles
        .filter((profile) => !EXCLUDED_USER_EMAILS.has((profile.email ?? "").toLowerCase()))
        .map((profile) => rowFromProfile(profile, roles[profile.id])),
    [profiles, roles]
  );

  const counts = useMemo(() => {
    const totals: Record<TabKey, number> = {
      all: allRows.length,
      patient: 0,
      doctor: 0,
      organization: 0,
      pharmacy: 0,
      "lab-diagnostics": 0,
    };

    allRows.forEach((row) => {
      if (row.user_type && totals[row.user_type as TabKey] !== undefined) totals[row.user_type as TabKey]++;
    });

    return totals;
  }, [allRows]);

  const filterFor = (key: TabKey) => {
    if (key === "all") return allRows;
    return allRows.filter((row) => row.user_type === key);
  };

  const openUserDetail = async (row: Row) => {
    setActiveUser(row);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await api.admin.users.detail(row.id);
      const profile = { ...(userProfileFromApi(response.data) as Profile), raw: asRecord(response.data) };
      const nextRole = roleToAppRole(profile.role || row.roleLabel);
      const detailedRow = rowFromProfile(profile, nextRole);

      setRoles((prev) => ({ ...prev, [detailedRow.id]: nextRole }));
      setProfiles((prev) => prev.map((item) => (item.id === detailedRow.id ? profile : item)));
      setActiveUser(detailedRow);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Could not load this user's full details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (row: Row) => {
    if (!row.manageable) return;

    const nextStatus = isActiveStatus(row.status) ? "suspended" : "active";
    setSavingId(row.id);

    try {
      if (nextStatus === "suspended") await api.admin.users.suspend(row.id);
      else await api.admin.users.activate(row.id);

      setProfiles((prev) =>
        prev.map((profile) => (profile.id === row.id ? { ...profile, status: nextStatus } : profile))
      );
      setActiveUser((current) => (current?.id === row.id ? { ...current, status: nextStatus } : current));
      toast({ title: nextStatus === "suspended" ? "User suspended" : "User activated", description: row.display });
    } catch (error) {
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Could not update user status.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (row: Row) => {
    if (!row.manageable) return;
    setDeleteTarget(row);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setSavingId(deleteTarget.id);
    try {
      await api.admin.users.delete(deleteTarget.id);
      setProfiles((prev) => prev.filter((profile) => profile.id !== deleteTarget.id));
      setActiveUser((current) => (current?.id === deleteTarget.id ? null : current));
      toast({ title: "User deleted", description: deleteTarget.display });
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete this user.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setDeleteBusy(false);
    }
  };

  const list = filterFor(tab);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Patients, doctors, organisations and admin users registered on Desol<span className="text-secondary">Med</span>.
          </p>
        </div>
        <Select value={tab} onValueChange={(value) => setTab(value as TabKey)}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Filter users" />
          </SelectTrigger>
          <SelectContent>
            {TABS.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label} ({counts[item.key]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 space-y-4">
        {loading ? (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              <UserCardSkeleton />
              <UserCardSkeleton />
              <UserCardSkeleton />
              <UserCardSkeleton />
              <UserCardSkeleton />
            </ul>
          </Card>
        ) : list.length > 0 ? (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {pagedList.map((row) => (
                  <li key={row.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <Avatar className="h-11 w-11 flex-shrink-0">
                        {row.avatar_url ? <AvatarImage src={row.avatar_url} alt="" /> : null}
                        <AvatarFallback className="bg-primary-soft text-primary text-sm font-medium">
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{row.display}</p>
                          <Badge variant="secondary" className={statusTone(row.status)}>
                            {prettyText(row.status, "Active")}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {row.role === "admin" || row.role === "super_admin" ? (
                              <ShieldCheck className="mr-1 h-3 w-3" />
                            ) : null}
                            {prettyText(row.roleLabel)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {row.subtitle && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {row.subtitle}
                            </span>
                          )}
                          {row.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {row.email}
                            </span>
                          )}
                          {row.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {row.phone}
                            </span>
                          )}
                          {row.created_at && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {fmtDate(row.created_at)}
                            </span>
                          )}
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
                          <DropdownMenuItem onClick={() => openUserDetail(row)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View full details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(row)} disabled={savingId === row.id}>
                            <Ban className="h-4 w-4 mr-2" />
                            {isActiveStatus(row.status) ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteUser(row)}
                            disabled={savingId === row.id}
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
                  Page {currentPage} of {totalPages} - {list.length} total
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Prev</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No users found from the backend for this filter.
          </Card>
        )}
      </div>

      <Dialog
        open={Boolean(activeUser)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveUser(null);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[86vh] overflow-hidden p-0">
          {activeUser && (
            <>
              <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3 pr-7">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    {activeUser.avatar_url ? <AvatarImage src={activeUser.avatar_url} alt="" /> : null}
                    <AvatarFallback className="bg-primary-soft text-primary font-medium">
                      {activeUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <DialogTitle className="text-base sm:text-lg">{activeUser.display}</DialogTitle>
                    <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className={statusTone(activeUser.status)}>
                        {prettyText(activeUser.status, "Active")}
                      </Badge>
                      <Badge variant="outline">{prettyText(activeUser.roleLabel)}</Badge>
                      {activeUser.user_type && <span>{prettyText(activeUser.user_type)}</span>}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="max-h-[54vh] overflow-y-auto px-5 py-5 sm:px-6">
                {detailLoading && (
                  <div className="mb-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoFieldSkeleton />
                      <InfoFieldSkeleton />
                      <InfoFieldSkeleton />
                      <InfoFieldSkeleton />
                      <InfoFieldSkeleton />
                      <InfoFieldSkeleton />
                    </div>
                  </div>
                )}

                {detailError && (
                  <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {detailError}
                  </div>
                )}

                {!detailLoading && !detailError && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoField label="Role" value={prettyText(activeUser.roleLabel)} />
                      <InfoField label="Email" value={activeUser.email} />
                      <InfoField label="Phone" value={activeUser.phone} />
                      <InfoField label="User type" value={prettyText(activeUser.user_type)} />
                      <InfoField label="Status" value={prettyText(activeUser.status, "Active")} />
                      <InfoField label="Organization" value={activeUser.organization_name} />
                      <InfoField label="Website" value={activeUser.website_url} />
                      <InfoField label="Joined" value={fmtDate(activeUser.created_at)} />
                    </div>

                    {detailRowsFor(activeUser.raw).length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold">Additional information</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {detailRowsFor(activeUser.raw).map((row) => (
                            <InfoField key={row.key} label={row.label} value={row.value} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter className="border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:space-x-0 gap-2 sm:px-6">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(activeUser)}
                  disabled={savingId === activeUser.id}
                  className="w-full sm:w-auto"
                >
                  <Ban className="h-4 w-4" />
                  {isActiveStatus(activeUser.status) ? "Suspend user" : "Activate user"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(activeUser)}
                  disabled={savingId === activeUser.id}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete user
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        description={`This will remove ${deleteTarget?.display ?? "this user"} from the admin user list.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDeleteUser}
      />
    </DashboardLayout>
  );
};

const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 break-words text-sm text-foreground">{value || "Not provided"}</p>
  </div>
);

export default UsersPage;
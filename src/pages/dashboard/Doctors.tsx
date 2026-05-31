import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Stethoscope,
  Globe,
  Plus,
  ExternalLink,
  Trash2,
  MapPin,
  Calendar,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalRegistration, type LocalProfile } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, userProfileFromApi } from "@/lib/backendAdapters";

type DoctorProfile = {
  registration: LocalRegistration;
  profile: LocalProfile | null;
  miniSite?: {
    slug: string;
    public_url: string;
    admin_url: string;
  } | null;
};

const DoctorsPageInner = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.admin.users.list({ role: "doctor" });
      const approvedDoctors = collection(response.data).map((entry: any) => {
        const profile = userProfileFromApi(entry) as LocalProfile;
        const registration: LocalRegistration = {
          id: profile.id,
          applicant_type: "doctor",
          status: "approved",
          full_name: profile.full_name,
          organization_name: profile.organization_name,
          email: profile.email ?? "",
          phone: profile.phone,
          city: entry?.city ?? entry?.profile?.city ?? null,
          state: entry?.state_name ?? entry?.state ?? entry?.profile?.state ?? null,
          zone: entry?.zone_name ?? entry?.zone ?? entry?.profile?.zone ?? null,
          specialty: entry?.specialty_name ?? entry?.specialty ?? entry?.profile?.specialty ?? null,
          details: entry?.profile ?? {},
          documents: [],
          reviewer_notes: null,
          reviewed_at: null,
          created_at: profile.created_at,
        };
        return { registration, profile, miniSite: null } as DoctorProfile;
      });
      const miniSites = await Promise.allSettled(
        approvedDoctors.map((doctor) => api.admin.doctors.miniSite(doctor.registration.id)),
      );
      setDoctors(
        approvedDoctors.map((doctor, index) => ({
          ...doctor,
          miniSite:
            miniSites[index].status === "fulfilled"
              ? {
                  slug: miniSites[index].value.data.slug,
                  public_url: miniSites[index].value.data.public_url,
                  admin_url: miniSites[index].value.data.admin_url,
                }
              : null,
        })),
      );
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = doctors.filter((d) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      d.registration.full_name?.toLowerCase().includes(needle) ||
      d.registration.email?.toLowerCase().includes(needle) ||
      d.registration.specialty?.toLowerCase().includes(needle) ||
      d.registration.city?.toLowerCase().includes(needle)
    );
  });

  const handleEditWebsite = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setWebsiteUrl(doctor.profile?.website_url || "");
    setShowDialog(true);
  };

  const handleSaveWebsite = async () => {
    if (!selectedDoctor?.profile) return;
    setBusy(true);
    try {
      toast({
        title: "Website not updated",
        description: "This backend only exposes doctor self-profile updates for website details.",
      });
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update website link",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!selectedDoctor?.profile) return;
    setBusy(true);
    try {
      toast({
        title: "Website not removed",
        description: "This backend only exposes doctor self-profile updates for website details.",
      });
      setShowDeleteAlert(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove website link",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Approved Doctors</h1>
          <p className="text-slate-600">Manage doctor profiles and their website links</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, specialty, or city..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading doctors...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <Card className="p-8 text-center">
            <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {doctors.length === 0
                ? "No approved doctors yet"
                : "No doctors match your search"}
            </p>
          </Card>
        )}

        {/* Doctors grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4">
            {filtered.map((doctor) => (
              <Card key={doctor.registration.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Doctor info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {doctor.registration.full_name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          <Mail className="inline h-3.5 w-3.5 mr-1" />
                          {doctor.registration.email}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="bg-primary-soft text-primary">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {doctor.registration.specialty || "General"}
                          </Badge>
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            <MapPin className="h-3 w-3 mr-1" />
                            {doctor.registration.city}, {doctor.registration.state}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            Registered {fmtDate(doctor.registration.created_at)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {doctor.miniSite?.public_url ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doctor.miniSite?.public_url, "_blank")}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Doctor-site
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doctor.miniSite?.admin_url, "_blank")}
                          className="gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Open Admin
                        </Button>
                      </>
                    ) : doctor.profile?.website_url ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doctor.profile?.website_url, "_blank")}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Website
                        </Button>
                      </>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        No mini-site yet
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Website edit dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDoctor?.profile?.website_url
                  ? "Edit Website Link"
                  : "Create Website Link"}
              </DialogTitle>
              <DialogDescription>
                Add or update the website link for Dr. {selectedDoctor?.registration.full_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the doctor's website or practice link
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveWebsite}
                disabled={busy || !websiteUrl.trim()}
                className="gap-2"
              >
                {busy ? "Saving..." : "Save Link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Website Link?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the website link for Dr. {selectedDoctor?.registration.full_name}.
                The button will change back to "Create Link".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWebsite}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700"
              >
                {busy ? "Removing..." : "Remove Link"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default DoctorsPageInner;

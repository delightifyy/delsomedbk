import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Users, Bell, MessageSquare, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = { users: number; adverts: number; contacts: number; posts: number };

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-4 text-xs tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-3xl font-bold">{value}</p>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, adverts: 0, contacts: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadBackendStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [users, applications, contacts, adverts] = await Promise.all([
          api.admin.users.list({ page: 1 }),
          api.admin.applications.list({ page: 1 }),
          api.admin.contactMessages.list({ page: 1 }),
          api.admin.adverts.list({ page: 1 }),
        ]);
        if (!cancelled) {
          setStats({
            users: users.meta?.total ?? collection(users.data).length,
            adverts: applications.meta?.total ?? collection(applications.data).length,
            contacts: contacts.meta?.total ?? collection(contacts.data).length,
            posts: adverts.meta?.total ?? collection(adverts.data).length,
          });
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load dashboard statistics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBackendStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      <p className="text-muted-foreground text-sm mt-1">A quick snapshot of your platform.</p>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-3 w-24" />
              <Skeleton className="mt-3 h-9 w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={Users} label="Total users" value={stats.users} />
            <StatCard icon={Bell} label="New Registrations" value={stats.adverts} />
            <StatCard icon={MessageSquare} label="Contact messages" value={stats.contacts} />
            <StatCard icon={FileText} label="Health Adverts" value={stats.posts} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Overview;

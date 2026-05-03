import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getDashboardStats } from "@/lib/localStore";
import { Users, Bell, MessageSquare, FileText } from "lucide-react";

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

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      <p className="text-muted-foreground text-sm mt-1">A quick snapshot of your platform.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats.users} />
        <StatCard icon={Bell} label="New Registrations" value={stats.adverts} />
        <StatCard icon={MessageSquare} label="Contact messages" value={stats.contacts} />
        <StatCard icon={FileText} label="Blog posts" value={stats.posts} />
      </div>
    </DashboardLayout>
  );
};

export default Overview;

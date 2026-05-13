import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Search } from "lucide-react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

type LogEntry = {
  id: string;
  event: string;
  log_name: string;
  description: string;
  causer: string;
  subject: string;
  created_at: string;
};

const asLogEntry = (entry: any): LogEntry => ({
  id: String(entry?.id ?? crypto.randomUUID()),
  event: String(entry?.event ?? entry?.action ?? "activity"),
  log_name: String(entry?.log_name ?? "default"),
  description: String(entry?.description ?? entry?.message ?? ""),
  causer: String(entry?.causer?.name ?? entry?.causer?.email ?? entry?.causer_id ?? "System"),
  subject: String(entry?.subject_type ?? entry?.subject ?? ""),
  created_at: String(entry?.created_at ?? new Date().toISOString()),
});

const ActivityLogsPage = () => {
  const [items, setItems] = useState<LogEntry[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.admin.activityLogs.list(q ? { event: q } : undefined);
      setItems(collection(response.data).map(asLogEntry));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((entry) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return `${entry.event} ${entry.log_name} ${entry.description} ${entry.causer} ${entry.subject}`.toLowerCase().includes(needle);
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Read-only audit trail from the backend.</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search logs..." className="pl-9" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No activity logs found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((entry) => (
              <li key={entry.id} className="p-4 flex items-start gap-3">
                <span className="mt-1 grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Activity className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{entry.event}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{entry.log_name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.description || "No description"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.causer} / {entry.subject || "No subject"} / {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogsPage;

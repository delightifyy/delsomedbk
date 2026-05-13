import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, MailCheck } from "lucide-react";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

type Subscriber = {
  id: string;
  email: string;
  status: string;
  created_at: string;
  confirmed_at?: string | null;
};

const ALL = "all";

const asSubscriber = (entry: any): Subscriber => ({
  id: String(entry?.id ?? entry?.uuid ?? entry?.email ?? crypto.randomUUID()),
  email: String(entry?.email ?? ""),
  status: String(entry?.status ?? "pending"),
  created_at: String(entry?.created_at ?? entry?.subscribed_at ?? new Date().toISOString()),
  confirmed_at: entry?.confirmed_at ?? null,
});

const NewsletterPage = () => {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [status, setStatus] = useState(ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.admin.newsletter.subscribers(status === ALL ? undefined : { status });
      setItems(collection(response.data).map(asSubscriber));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load newsletter subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const counts = useMemo(() => {
    const base = { all: items.length, pending: 0, confirmed: 0, unsubscribed: 0 };
    items.forEach((item) => {
      if (item.status in base) base[item.status as keyof typeof base] += 1;
    });
    return base;
  }, [items]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage DesolMed newsletter subscribers.</p>
        </div>
        <Button asChild variant="outline">
          <a href={api.admin.newsletter.exportUrl()} target="_blank" rel="noreferrer">
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(counts).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs capitalize text-muted-foreground">{key}</p>
              <p className="font-display text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No subscribers yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate inline-flex items-center gap-2">
                    <MailCheck className="h-4 w-4 text-primary" /> {item.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(item.created_at).toLocaleDateString()}
                    {item.confirmed_at ? ` / Confirmed ${new Date(item.confirmed_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-primary-soft px-2 py-1 text-xs font-medium text-primary capitalize">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewsletterPage;

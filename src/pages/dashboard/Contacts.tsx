import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { collection, contactMessageFromApi } from "@/lib/backendAdapters";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

// Skeleton Components
const MessageRowSkeleton = () => (
  <li className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-border">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <Skeleton className="mt-2 h-2 w-2 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
      <Skeleton className="h-4 w-24 hidden sm:block" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </li>
);

const MessagesListSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <ul className="divide-y divide-border">
      <MessageRowSkeleton />
      <MessageRowSkeleton />
      <MessageRowSkeleton />
      <MessageRowSkeleton />
      <MessageRowSkeleton />
    </ul>
  </div>
);

const ContactsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Msg | null>(null);
  const [deleting, setDeleting] = useState<Msg | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadBackend = async () => {
      setLoading(true);
      try {
        const response = await api.admin.contactMessages.list();
        const mapped = collection(response.data).map(contactMessageFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const view = async (m: Msg) => {
    setOpen(m);
    if (!m.read) {
      await api.admin.contactMessages.updateStatus(m.id, "read");
      setItems((prev) => prev.map((item) => item.id === m.id ? { ...item, read: true } : item));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.contactMessages.delete(deleting.id);
      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      setOpen((current) => (current?.id === deleting.id ? null : current));
      toast({ title: "Message deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "Message delete failed",
        description: error instanceof Error ? error.message : "Could not delete this message.",
        variant: "destructive",
      });
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-bold">Contact messages</h1>
      <p className="text-muted-foreground text-sm mt-1">Submissions from the contact form.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <MessagesListSkeleton />
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((m) => (
              <li key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`mt-2 h-2 w-2 rounded-full flex-shrink-0 ${m.read ? "bg-muted" : "bg-primary"}`} />
                  <button onClick={() => view(m)} className="flex-1 min-w-0 text-left">
                    <p className={`truncate ${m.read ? "" : "font-semibold"}`}>{m.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.name} · {m.email}</p>
                  </button>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(m)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{open?.subject}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">From <strong className="text-foreground">{open.name}</strong> &lt;{open.email}&gt;</p>
              <p className="text-sm whitespace-pre-wrap">{open.message}</p>
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject)}`}>
                  <Mail className="h-4 w-4" /> Reply by email
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        title="Delete contact message?"
        description={`This will remove the message from ${deleting?.name ?? "this sender"}.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default ContactsPage;
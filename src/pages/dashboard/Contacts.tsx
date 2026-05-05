import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteContactMessage, listContactMessages, markContactMessageRead, subscribeStore, type LocalContactMessage } from "@/lib/localStore";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

const ContactsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Msg[]>([]);
  const [open, setOpen] = useState<Msg | null>(null);

  const load = () => {
    setItems(listContactMessages() as LocalContactMessage[]);
  };
  useEffect(() => {
    const unsubscribe = subscribeStore(() => {
      load();
    });
    return unsubscribe;
  }, []);

  const view = async (m: Msg) => {
    setOpen(m);
    if (!m.read) {
      await markContactMessageRead(m.id);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteContactMessage(id);
    toast({ title: "Message deleted" });
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-bold">Contact messages</h1>
      <p className="text-muted-foreground text-sm mt-1">Submissions from the contact form.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
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
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
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
    </DashboardLayout>
  );
};

export default ContactsPage;

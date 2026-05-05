import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteFaq, listFaqs, subscribeStore, upsertFaq, type LocalFaq } from "@/lib/localStore";

const empty = { q: "", a: "" };

const FaqsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalFaq[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalFaq | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    const unsubscribe = subscribeStore(() => setItems(listFaqs()));
    return unsubscribe;
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalFaq) => {
    setEditing(item);
    setForm({ q: item.q, a: item.a });
    setOpen(true);
  };

  const save = async () => {
    await upsertFaq({ id: editing?.id, q: form.q.trim(), a: form.a.trim() });
    toast({ title: editing ? "FAQ updated" : "FAQ created" });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteFaq(id);
    toast({ title: "FAQ deleted" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage homepage frequently asked questions.</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New FAQ</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No FAQs yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.q}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.a}</p>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-1 sm:shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Question</Label><Input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} /></div>
            <div className="space-y-2"><Label>Answer</Label><Textarea rows={6} value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FaqsPage;

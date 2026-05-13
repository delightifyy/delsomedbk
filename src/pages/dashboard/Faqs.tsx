import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalFaq } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, faqFromApi } from "@/lib/backendAdapters";

type FormState = {
  q: string;
  a: string;
  sortOrder: string;
  published: boolean;
};

const empty: FormState = { q: "", a: "", sortOrder: "0", published: true };

const FaqsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalFaq[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalFaq | null>(null);
  const [deleting, setDeleting] = useState<LocalFaq | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    let cancelled = false;
    const loadBackend = async () => {
      try {
        const response = await api.admin.cms.faqs.list();
        const mapped = collection(response.data).map(faqFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      }
    };
    loadBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalFaq) => {
    setEditing(item);
    setForm({
      q: item.q,
      a: item.a,
      sortOrder: String(item.sort_order ?? 0),
      published: item.published ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.q.trim() || !form.a.trim()) {
      toast({
        title: "Required fields missing",
        description: "Question and answer are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        question: form.q.trim(),
        answer: form.a.trim(),
        sort_order: Number(form.sortOrder) || 0,
        is_published: form.published,
      };
      const response = editing
        ? await api.admin.cms.faqs.update(editing.id, payload)
        : await api.admin.cms.faqs.create(payload);
      const saved = response.data ? faqFromApi(response.data) : {
        id: editing?.id ?? crypto.randomUUID(),
        q: payload.question,
        a: payload.answer,
        published: payload.is_published,
        sort_order: payload.sort_order,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => editing ? prev.map((item) => item.id === editing.id ? saved : item) : [saved, ...prev]);
      toast({ title: editing ? "FAQ updated" : "FAQ created" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "FAQ save failed",
        description: error instanceof Error ? error.message : "Could not save this FAQ.",
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.cms.faqs.delete(deleting.id);
      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      toast({ title: "FAQ deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "FAQ delete failed",
        description: error instanceof Error ? error.message : "Could not delete this FAQ.",
        variant: "destructive",
      });
    } finally {
      setDeleteBusy(false);
    }
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
                <div className="flex items-center justify-end gap-2 sm:gap-3 sm:shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.published ?? true ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.published ?? true ? "Published" : "Draft"}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea rows={7} value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 sm:mt-7">
                  <Switch checked={form.published} onCheckedChange={(value) => setForm({ ...form, published: value })} />
                  <Label>Published</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        title="Delete FAQ?"
        description={`This will remove "${deleting?.q ?? "this FAQ"}" from the FAQ list.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default FaqsPage;

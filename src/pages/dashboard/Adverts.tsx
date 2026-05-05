import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteAdvert, listAdverts, subscribeStore, upsertAdvert, type LocalAdvert } from "@/lib/localStore";

type FormState = {
  title: string;
  sponsor: string;
  category: string;
  zone: string;
  state: string;
  city: string;
  description: string;
  image: string;
  date_label: string;
  read_time: string;
  author: string;
  author_role: string;
  cta_label: string;
  published: boolean;
};

const empty: FormState = {
  title: "",
  sponsor: "",
  category: "Hospital",
  zone: "South",
  state: "",
  city: "",
  description: "",
  image: "",
  date_label: "",
  read_time: "",
  author: "",
  author_role: "",
  cta_label: "Read the story",
  published: true,
};

const AdvertsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalAdvert[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalAdvert | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    const unsubscribe = subscribeStore(() => setItems(listAdverts()));
    return unsubscribe;
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalAdvert) => {
    setEditing(item);
    setForm({
      title: item.title,
      sponsor: item.sponsor,
      category: item.category,
      zone: item.zone,
      state: item.state,
      city: item.city,
      description: item.description,
      image: item.image ?? "",
      date_label: item.date_label ?? "",
      read_time: item.read_time ?? "",
      author: item.author ?? "",
      author_role: item.author_role ?? "",
      cta_label: item.cta_label ?? "Read the story",
      published: item.published,
    });
    setOpen(true);
  };

  const save = async () => {
    await upsertAdvert({
      id: editing?.id,
      title: form.title.trim(),
      sponsor: form.sponsor.trim(),
      category: form.category.trim(),
      zone: form.zone.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      description: form.description.trim(),
      image: form.image.trim() || null,
      date_label: form.date_label.trim() || null,
      read_time: form.read_time.trim() || null,
      author: form.author.trim() || null,
      author_role: form.author_role.trim() || null,
      cta_label: form.cta_label.trim() || "Read the story",
      published: form.published,
    });
    toast({ title: editing ? "Advert updated" : "Advert created" });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this advert?")) return;
    await deleteAdvert(id);
    toast({ title: "Advert deleted" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Health Adverts</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and publish adverts visible on the public adverts page.</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New advert</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No adverts yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sponsor} · {item.city}, {item.state}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.published ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
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
          <DialogHeader><DialogTitle>{editing ? "Edit advert" : "New advert"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sponsor</Label><Input value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Zone</Label><Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL (optional)</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Date label (optional)</Label><Input value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} /></div>
              <div className="space-y-2"><Label>Read time (optional)</Label><Input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Author (optional)</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div className="space-y-2"><Label>Author role (optional)</Label><Input value={form.author_role} onChange={(e) => setForm({ ...form, author_role: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>CTA label</Label><Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} /></div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(value) => setForm({ ...form, published: value })} />
              <Label>Published</Label>
            </div>
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

export default AdvertsPage;

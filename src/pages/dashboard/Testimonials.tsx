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
import {
  deleteTestimonial,
  listTestimonials,
  subscribeStore,
  upsertTestimonial,
  type LocalTestimonial,
} from "@/lib/localStore";

type FormState = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  published: boolean;
};

const empty: FormState = {
  quote: "",
  name: "",
  role: "",
  initials: "",
  published: true,
};

const deriveInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const TestimonialsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalTestimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalTestimonial | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => subscribeStore(() => setItems(listTestimonials())), []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalTestimonial) => {
    setEditing(item);
    setForm({
      quote: item.quote,
      name: item.name,
      role: item.role,
      initials: item.initials,
      published: item.published,
    });
    setOpen(true);
  };

  const save = async () => {
    await upsertTestimonial({
      id: editing?.id,
      quote: form.quote.trim(),
      name: form.name.trim(),
      role: form.role.trim(),
      initials: (form.initials.trim() || deriveInitials(form.name)).toUpperCase(),
      published: form.published,
    });
    toast({ title: editing ? "Testimonial updated" : "Testimonial created" });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial(id);
    toast({ title: "Testimonial deleted" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Control customer testimonials shown on the homepage.</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> New testimonial</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No testimonials yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name} <span className="text-muted-foreground text-sm">· {item.role}</span></p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">"{item.quote}"</p>
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
          <DialogHeader><DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Quote</Label><Textarea rows={5} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, initials: editing ? form.initials : deriveInitials(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Initials</Label><Input maxLength={3} value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase() })} /></div>
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

export default TestimonialsPage;

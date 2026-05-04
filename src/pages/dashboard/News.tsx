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
  deleteNewsArticle,
  listNewsArticles,
  subscribeStore,
  upsertNewsArticle,
  type LocalNewsArticle,
} from "@/lib/localStore";

type FormState = {
  title: string;
  slug: string;
  category: string;
  date: string;
  excerpt: string;
  body: string;
  author: string;
  published: boolean;
};

const empty: FormState = {
  title: "",
  slug: "",
  category: "General",
  date: new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
  excerpt: "",
  body: "",
  author: "DesolMed Editorial",
  published: true,
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const NewsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalNewsArticle[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalNewsArticle | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => subscribeStore(() => setItems(listNewsArticles())), []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalNewsArticle) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      date: item.date,
      excerpt: item.excerpt,
      body: item.body.join("\n\n"),
      author: item.author ?? "",
      published: item.published,
    });
    setOpen(true);
  };

  const save = async () => {
    const body = form.body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await upsertNewsArticle({
      id: editing?.id,
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category: form.category.trim() || "General",
      date: form.date.trim(),
      excerpt: form.excerpt.trim(),
      body,
      author: form.author.trim() || null,
      published: form.published,
    });

    toast({ title: editing ? "News updated" : "News created" });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this news article?")) return;
    await deleteNewsArticle(id);
    toast({ title: "News deleted" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">News</h1>
          <p className="text-muted-foreground text-sm mt-1">Publish and edit health news stories.</p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" /> New story
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No stories yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">/{item.slug} · {item.category}</p>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit story" : "New story"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const next = e.target.value;
                  setForm({ ...form, title: next, slug: editing ? form.slug : slugify(next) });
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Date label</Label>
                <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Body (one paragraph per line)</Label>
              <Textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
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

export default NewsPage;

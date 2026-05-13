import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type LocalNewsArticle } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, lookupOptionFromApi, newsArticleFromApi, type LookupOption } from "@/lib/backendAdapters";

type FormState = {
  title: string;
  categoryId: string;
  publishedAt: string;
  excerpt: string;
  body: string;
  source: string;
  readTimeMinutes: string;
  featured: boolean;
  status: "draft" | "published";
};

const NONE = "__none";
const today = () => new Date().toISOString().slice(0, 10);

const empty: FormState = {
  title: "",
  categoryId: "",
  publishedAt: today(),
  excerpt: "",
  body: "",
  source: "DesolMed Editorial",
  readTimeMinutes: "5",
  featured: false,
  status: "published",
};

const toDateInput = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? today() : date.toISOString().slice(0, 10);
};

const findOptionId = (options: LookupOption[], label: string) =>
  options.find((option) => option.label.toLowerCase() === label.toLowerCase())?.id ?? "";

const NewsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LocalNewsArticle[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<LookupOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalNewsArticle | null>(null);
  const [deleting, setDeleting] = useState<LocalNewsArticle | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    let cancelled = false;

    const loadBackend = async () => {
      try {
        const response = await api.admin.posts.list({ type: "news" });
        const mapped = collection(response.data).map(newsArticleFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.lookups.postCategories();
        const mapped = collection(response.data).map(lookupOptionFromApi);
        if (!cancelled) setCategoryOptions(mapped);
      } catch {
        if (!cancelled) setCategoryOptions([]);
      }
    };

    loadBackend();
    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: LocalNewsArticle) => {
    setEditing(item);
    setForm({
      title: item.title,
      categoryId: findOptionId(categoryOptions, item.category),
      publishedAt: toDateInput(item.created_at || item.date),
      excerpt: item.excerpt,
      body: item.body.join("\n\n"),
      source: item.author ?? "",
      readTimeMinutes: "5",
      featured: false,
      status: item.published ? "published" : "draft",
    });
    setOpen(true);
  };

  const save = async () => {
    const body = form.body.trim();
    if (!form.title.trim() || !body) {
      toast({
        title: "Required fields missing",
        description: "Title and body are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedCategory = categoryOptions.find((option) => option.id === form.categoryId);
      const payload = {
        type: "news",
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        body,
        category_id: form.categoryId ? Number(form.categoryId) || form.categoryId : undefined,
        external_source: form.source.trim() || undefined,
        read_time_minutes: Number(form.readTimeMinutes) || undefined,
        is_featured: form.featured,
        status: form.status,
        published_at: form.status === "published" ? form.publishedAt || today() : undefined,
      };
      const response = editing
        ? await api.admin.posts.update(editing.id, payload)
        : await api.admin.posts.create(payload);
      const saved = response.data ? newsArticleFromApi(response.data) : {
        id: editing?.id ?? crypto.randomUUID(),
        slug: editing?.slug ?? crypto.randomUUID(),
        title: payload.title,
        category: selectedCategory?.label ?? "General",
        date: payload.published_at ?? today(),
        excerpt: payload.excerpt ?? "",
        body: body.split(/\n{2,}|\r?\n/).map((line) => line.trim()).filter(Boolean),
        author: payload.external_source ?? null,
        published: payload.status === "published",
        created_at: new Date().toISOString(),
      };
      setItems((prev) => editing ? prev.map((item) => item.id === editing.id ? saved : item) : [saved, ...prev]);
      toast({ title: editing ? "News updated" : "News created" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "News save failed",
        description: error instanceof Error ? error.message : "Could not save this story.",
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.admin.posts.delete(deleting.id);
      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      toast({ title: "News deleted" });
      setDeleting(null);
    } catch (error) {
      toast({
        title: "News delete failed",
        description: error instanceof Error ? error.message : "Could not delete this story.",
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
                  <p className="text-xs text-muted-foreground truncate">/{item.slug} / {item.category}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.published ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.published ? "Published" : "Draft"}
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
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>{editing ? "Edit story" : "New story"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as FormState["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.categoryId || NONE} onValueChange={(value) => setForm({ ...form, categoryId: value === NONE ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No category</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Published date</Label>
                  <Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Source / author label</Label>
                  <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Read time minutes</Label>
                  <Input type="number" min="1" max="999" value={form.readTimeMinutes} onChange={(e) => setForm({ ...form, readTimeMinutes: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea rows={11} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <Switch checked={form.featured} onCheckedChange={(value) => setForm({ ...form, featured: value })} />
                <Label>Featured</Label>
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
        title="Delete news story?"
        description={`This will remove "${deleting?.title ?? "this story"}" from the news list.`}
        loading={deleteBusy}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </DashboardLayout>
  );
};

export default NewsPage;

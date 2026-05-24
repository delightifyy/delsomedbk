import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Pencil, X, Save, Loader2, RefreshCw,
  Stethoscope, Calendar, Users, ListChecks, FileText, CreditCard,
  Building2, Sparkles, Settings, ClipboardList, Link2, ChevronRight,
} from "lucide-react";
import { listAll, upsertRow, deleteRow, type TableName } from "@/lib/bookingAdminApi";
import { supabase } from "@/integrations/supabase/client";

/* ---------- atoms ---------- */
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
const taCls = inputCls + " min-h-[80px]";
const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

/* ---------- field schema ---------- */
type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "tags" | "json" | "date" | "time" | "money";
type FieldDef = { key: string; label: string; type: FieldType; options?: { value: string; label: string }[]; help?: string; full?: boolean };
type Resource = {
  id: TableName;
  label: string;
  icon: any;
  orderBy: string;
  asc?: boolean;
  primaryField: string;
  secondaryFields?: string[];
  fields: FieldDef[];
  /** dynamic options loaded from another table for select fields */
  dynamicSelects?: { fieldKey: string; from: TableName; valueKey?: string; labelKey: string }[];
};

const RESOURCES: Resource[] = [
  {
    id: "booking_concern_categories", label: "Concern Categories", icon: Stethoscope,
    orderBy: "sort_order", primaryField: "name", secondaryFields: ["description"],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "icon", label: "Icon name", type: "text", help: "Lucide icon (e.g. Brain, Heart)" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "description", label: "Description", type: "textarea", full: true },
    ],
  },
  {
    id: "booking_concerns", label: "Concerns", icon: ListChecks,
    orderBy: "sort_order", primaryField: "name", secondaryFields: ["severity"],
    dynamicSelects: [{ fieldKey: "category_id", from: "booking_concern_categories", labelKey: "name" }],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "category_id", label: "Category", type: "select" },
      { key: "severity", label: "Severity", type: "select", options: [
        { value: "routine", label: "Routine" }, { value: "urgent", label: "Urgent" }, { value: "emergency", label: "Emergency" },
      ]},
      { key: "tags", label: "Tags", type: "tags", help: "Comma separated" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "description", label: "Description", type: "textarea", full: true },
    ],
  },
  {
    id: "booking_clinician_types", label: "Clinician Types", icon: Users,
    orderBy: "sort_order", primaryField: "title", secondaryFields: ["badge"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "badge", label: "Badge", type: "text", help: "e.g. Most popular" },
      { key: "price_cents", label: "Price", type: "money" },
      { key: "currency", label: "Currency", type: "text" },
      { key: "wait_time_minutes", label: "Wait time (min)", type: "number" },
      { key: "duration_minutes", label: "Duration (min)", type: "number" },
      { key: "image_url", label: "Image URL", type: "text", full: true },
      { key: "treats", label: "Treats", type: "textarea", full: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    id: "booking_concern_clinician_map", label: "Concern → Clinician", icon: Link2,
    orderBy: "priority", primaryField: "id",
    dynamicSelects: [
      { fieldKey: "concern_id", from: "booking_concerns", labelKey: "name" },
      { fieldKey: "clinician_type_id", from: "booking_clinician_types", labelKey: "title" },
    ],
    fields: [
      { key: "concern_id", label: "Concern", type: "select" },
      { key: "clinician_type_id", label: "Clinician", type: "select" },
      { key: "priority", label: "Priority", type: "number" },
      { key: "recommended", label: "Recommended", type: "checkbox" },
    ],
  },
  {
    id: "booking_time_slots", label: "Time Slots", icon: Calendar,
    orderBy: "slot_date", primaryField: "slot_date", secondaryFields: ["slot_time", "status"],
    dynamicSelects: [{ fieldKey: "clinician_type_id", from: "booking_clinician_types", labelKey: "title" }],
    fields: [
      { key: "clinician_type_id", label: "Clinician", type: "select" },
      { key: "slot_date", label: "Date", type: "date" },
      { key: "slot_time", label: "Time", type: "time" },
      { key: "capacity", label: "Capacity", type: "number" },
      { key: "booked_count", label: "Booked count", type: "number" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "available", label: "Available" }, { value: "blocked", label: "Blocked" }, { value: "full", label: "Full" },
      ]},
    ],
  },
  {
    id: "booking_intake_fields", label: "Intake Form Fields", icon: ClipboardList,
    orderBy: "sort_order", primaryField: "label", secondaryFields: ["field_key", "field_type"],
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "field_key", label: "Key", type: "text", help: "Stored as patient_data[key]" },
      { key: "field_type", label: "Type", type: "select", options: [
        { value: "text", label: "Text" }, { value: "email", label: "Email" }, { value: "tel", label: "Phone" },
        { value: "date", label: "Date" }, { value: "textarea", label: "Textarea" }, { value: "select", label: "Select" },
      ]},
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "options", label: "Options (JSON)", type: "json", help: 'e.g. ["Male","Female"]', full: true },
      { key: "required", label: "Required", type: "checkbox" },
      { key: "visible", label: "Visible", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "booking_legal_agreements", label: "Legal Agreements", icon: FileText,
    orderBy: "sort_order", primaryField: "title", secondaryFields: ["agreement_type"],
    fields: [
      { key: "key", label: "Key", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "agreement_type", label: "Type", type: "select", options: [
        { value: "consent", label: "Consent" }, { value: "terms", label: "Terms" }, { value: "privacy", label: "Privacy" }, { value: "warning", label: "Warning" },
      ]},
      { key: "required", label: "Required", type: "checkbox" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "body", label: "Body", type: "textarea", full: true },
    ],
  },
  {
    id: "booking_payment_methods", label: "Payment Methods", icon: CreditCard,
    orderBy: "sort_order", primaryField: "label", secondaryFields: ["key"],
    fields: [
      { key: "key", label: "Key", type: "text", help: "card | hmo | subscription" },
      { key: "label", label: "Label", type: "text" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "enabled", label: "Enabled", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "booking_hmo_providers", label: "HMO Providers", icon: Building2,
    orderBy: "sort_order", primaryField: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "booking_subscription_plans", label: "Subscription Plans", icon: Sparkles,
    orderBy: "sort_order", primaryField: "name", secondaryFields: ["billing_period"],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "price_cents", label: "Price", type: "money" },
      { key: "currency", label: "Currency", type: "text" },
      { key: "billing_period", label: "Billing period", type: "select", options: [
        { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" },
      ]},
      { key: "perks", label: "Perks (JSON array)", type: "json", help: 'e.g. ["Free GP visits","Priority support"]', full: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    id: "booking_settings", label: "Booking Settings", icon: Settings,
    orderBy: "id", primaryField: "currency",
    fields: [
      { key: "currency", label: "Currency code", type: "text" },
      { key: "currency_symbol", label: "Currency symbol", type: "text" },
      { key: "tax_percent", label: "Tax %", type: "number" },
      { key: "emergency_warning", label: "Emergency warning", type: "textarea", full: true },
      { key: "booking_notice", label: "Booking notice", type: "textarea", full: true },
      { key: "confirmation_message", label: "Confirmation message", type: "textarea", full: true },
    ],
  },
];

/* ---------- helpers ---------- */
const summarize = (r: Resource, row: any) => {
  const p = row[r.primaryField];
  const s = (r.secondaryFields || []).map((k) => row[k]).filter(Boolean).join(" · ");
  return { primary: String(p ?? "—"), secondary: s };
};

const newDefaultRow = (r: Resource) => {
  const out: any = {};
  r.fields.forEach((f) => {
    out[f.key] =
      f.type === "checkbox" ? true :
      f.type === "number" || f.type === "money" ? 0 :
      f.type === "tags" ? [] :
      f.type === "json" ? [] :
      "";
  });
  return out;
};

/* =========================================================
                       Main Page
========================================================= */
export default function BookingAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = new Set<string>([...RESOURCES.map((r) => r.id), "bookings"]);
  const initialTab = (() => {
    const t = searchParams.get("tab");
    return t && validTabs.has(t) ? (t as TableName) : ("booking_concern_categories" as TableName);
  })();
  const [active, setActive] = useState<TableName>(initialTab);
  const [rows, setRows] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [optionsCache, setOptionsCache] = useState<Record<string, { id: string; label: string }[]>>({});

  const resource = useMemo(() => RESOURCES.find((r) => r.id === active)!, [active]);

  useEffect(() => { document.title = "Booking Admin — MediCare"; }, []);

  // Sync ?tab= → active when URL changes (e.g. clicking sidebar links inside admin)
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && validTabs.has(t) && t !== active) setActive(t as TableName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Keep URL in sync when user switches tabs from the sidebar
  useEffect(() => {
    if (searchParams.get("tab") !== active) {
      setSearchParams({ tab: active }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listAll(active, resource.orderBy);
      setRows(data);
      // load any dynamic select option sources used by this resource
      const dynSelects = resource.dynamicSelects || [];
      const cache: Record<string, { id: string; label: string }[]> = { ...optionsCache };
      await Promise.all(dynSelects.map(async (ds) => {
        const cacheKey = ds.from;
        if (cache[cacheKey]) return;
        const opt = await listAll(ds.from, "sort_order");
        cache[cacheKey] = opt.map((o: any) => ({ id: o.id, label: o[ds.labelKey] || o.id }));
      }));
      setOptionsCache(cache);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally { setLoading(false); }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (e: any) { toast.error(e.message || "Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (active === "bookings") loadBookings(); else refresh(); }, [active]);

  const onSave = async () => {
    try {
      const payload = { ...editing };
      // coerce types
      resource.fields.forEach((f) => {
        if (f.type === "number") payload[f.key] = Number(payload[f.key] ?? 0);
        if (f.type === "money") payload[f.key] = Math.round(Number(payload[f.key] ?? 0) * 100);
        if (f.type === "tags") payload[f.key] = Array.isArray(payload[f.key]) ? payload[f.key] : String(payload[f.key] || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (f.type === "json") {
          try { payload[f.key] = typeof payload[f.key] === "string" ? JSON.parse(payload[f.key]) : payload[f.key]; }
          catch { throw new Error(`Invalid JSON in ${f.label}`); }
        }
        if (f.type === "checkbox") payload[f.key] = !!payload[f.key];
      });
      await upsertRow(active, payload);
      toast.success(editing.id ? "Updated" : "Created");
      setEditing(null);
      refresh();
    } catch (e: any) { toast.error(e.message || "Save failed"); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try { await deleteRow(active, id); toast.success("Deleted"); refresh(); }
    catch (e: any) { toast.error(e.message || "Delete failed"); }
  };

  const onEdit = (row: any) => {
    const display: any = { ...row };
    resource.fields.forEach((f) => {
      if (f.type === "money") display[f.key] = (Number(row[f.key] || 0) / 100).toString();
      if (f.type === "json") display[f.key] = JSON.stringify(row[f.key] ?? [], null, 2);
      if (f.type === "tags") display[f.key] = Array.isArray(row[f.key]) ? row[f.key].join(", ") : "";
      if (f.type === "date" && row[f.key]) display[f.key] = String(row[f.key]).slice(0, 10);
      if (f.type === "time" && row[f.key]) display[f.key] = String(row[f.key]).slice(0, 5);
    });
    setEditing(display);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen w-72 bg-white border-r border-slate-200">
        <div className="h-16 px-5 flex items-center border-b border-slate-200">
          <Link to="/doctor-portal/admin" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to CMS
          </Link>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Booking Engine</p>
          <nav className="space-y-0.5">
            {RESOURCES.map((r) => {
              const Ic = r.icon;
              return (
                <button key={r.id} onClick={() => setActive(r.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${active === r.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Ic className="h-4 w-4" /> {r.label}
                </button>
              );
            })}
            <div className="my-3 border-t border-slate-200" />
            <button onClick={() => setActive("bookings" as TableName)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${active === "bookings" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <ClipboardList className="h-4 w-4" /> Bookings (orders)
            </button>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Booking admin</p>
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {active === "bookings" ? "Bookings (orders)" : resource.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => active === "bookings" ? loadBookings() : refresh()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            {active !== "bookings" && (
              <button onClick={() => setEditing(newDefaultRow(resource))} className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New
              </button>
            )}
          </div>
        </header>

        {/* Mobile resource selector */}
        <div className="lg:hidden p-3 border-b border-slate-200 bg-white">
          <select value={active} onChange={(e) => setActive(e.target.value as TableName)} className={inputCls}>
            {RESOURCES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            <option value="bookings">Bookings (orders)</option>
          </select>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : active === "bookings" ? (
            <BookingsTable bookings={bookings} />
          ) : (
            <ResourceList resource={resource} rows={rows} onEdit={onEdit} onDelete={onDelete} optionsCache={optionsCache} />
          )}
        </div>
      </main>

      {editing && (
        <EditDrawer
          resource={resource}
          row={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          optionsCache={optionsCache}
        />
      )}
    </div>
  );
}

/* ---------- list ---------- */
function ResourceList({ resource, rows, onEdit, onDelete, optionsCache }: {
  resource: Resource; rows: any[]; onEdit: (r: any) => void; onDelete: (id: string) => void;
  optionsCache: Record<string, { id: string; label: string }[]>;
}) {
  if (!rows.length) {
    return <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-500 text-sm">No items yet. Click <strong>New</strong> to add the first one.</div>;
  }
  // build lookup for select labels
  const lookup = (fieldKey: string, val: any) => {
    const ds = resource.dynamicSelects?.find((d) => d.fieldKey === fieldKey);
    if (!ds) return val;
    return optionsCache[ds.from]?.find((o) => o.id === val)?.label || val;
  };
  return (
    <div className="grid gap-2">
      {rows.map((row) => {
        const { primary, secondary } = summarize(resource, row);
        // for FK-only tables (like map), show resolved labels
        const fkSummary = resource.dynamicSelects?.map((ds) => lookup(ds.fieldKey, row[ds.fieldKey])).filter(Boolean).join("  →  ");
        return (
          <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{fkSummary || primary}</p>
              {secondary && <p className="text-xs text-slate-500 truncate mt-0.5">{secondary}</p>}
            </div>
            {"active" in row && (
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${row.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {row.active ? "Active" : "Inactive"}
              </span>
            )}
            <button onClick={() => onEdit(row)} className="grid place-items-center h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => onDelete(row.id)} className="grid place-items-center h-9 w-9 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- bookings ---------- */
function BookingsTable({ bookings }: { bookings: any[] }) {
  if (!bookings.length) return <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-500 text-sm">No bookings yet.</div>;
  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="p-3">Reference</th><th className="p-3">Patient</th><th className="p-3">Concern</th>
            <th className="p-3">Clinician</th><th className="p-3">When</th><th className="p-3">Amount</th>
            <th className="p-3">Status</th><th className="p-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="p-3 font-mono text-xs">{b.reference}</td>
              <td className="p-3">{b.patient_data?.full_name || b.patient_data?.name || "—"}</td>
              <td className="p-3">{b.concern_name || "—"}</td>
              <td className="p-3">{b.clinician_type_name || "—"}</td>
              <td className="p-3 whitespace-nowrap">{b.slot_date} {b.slot_time?.slice(0,5)}</td>
              <td className="p-3">{(b.currency || "NGN")} {((b.amount_cents || 0) / 100).toLocaleString()}</td>
              <td className="p-3"><span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{b.status}</span></td>
              <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{new Date(b.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- edit drawer ---------- */
function EditDrawer({ resource, row, onChange, onClose, onSave, optionsCache }: {
  resource: Resource; row: any; onChange: (r: any) => void; onClose: () => void; onSave: () => void;
  optionsCache: Record<string, { id: string; label: string }[]>;
}) {
  const set = (k: string, v: any) => onChange({ ...row, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 h-16 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">{row.id ? "Edit" : "New"} {resource.label.replace(/s$/, "")}</h2>
          <button onClick={onClose} className="grid place-items-center h-9 w-9 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 flex-1">
          {resource.fields.map((f) => {
            const ds = resource.dynamicSelects?.find((d) => d.fieldKey === f.key);
            const opts = ds ? optionsCache[ds.from] || [] : f.options || [];
            return (
              <div key={f.key} className={f.full || ["textarea", "json"].includes(f.type) ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <Field label={f.label} hint={f.help}>
                  {f.type === "textarea" ? (
                    <textarea className={taCls} value={row[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === "json" ? (
                    <textarea className={taCls + " font-mono text-xs"} value={typeof row[f.key] === "string" ? row[f.key] : JSON.stringify(row[f.key] ?? [], null, 2)} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === "checkbox" ? (
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!row[f.key]} onChange={(e) => set(f.key, e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                      <span className="text-sm text-slate-700">Enabled</span>
                    </label>
                  ) : f.type === "select" ? (
                    <select className={inputCls} value={row[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                      <option value="">—</option>
                      {(opts as any[]).map((o) => <option key={o.id || o.value} value={o.id || o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === "money" ? "number" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"}
                      step={f.type === "money" ? "0.01" : undefined}
                      className={inputCls} value={row[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </Field>
              </div>
            );
          })}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

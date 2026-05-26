import { X } from "lucide-react";

export function MediaPicker({
  value,
  onChange,
  label,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="grid place-items-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

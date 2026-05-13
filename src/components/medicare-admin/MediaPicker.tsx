import { useEffect, useRef, useState } from "react";
import { Upload, ImagePlus, X, Trash2, Film } from "lucide-react";
import type { MediaItem, MediCareSettings } from "@/lib/medicareSettings";

const uid = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export function MediaPicker({
  value,
  onChange,
  accept = "image",
  settings,
  setSettings,
  label,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: "image" | "video" | "any";
  settings: MediCareSettings;
  setSettings: (updater: (s: MediCareSettings) => MediCareSettings) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!open) setUrlInput(""); }, [open]);

  const acceptStr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    for (const f of Array.from(files)) {
      if (f.size > 4 * 1024 * 1024) {
        alert(`"${f.name}" is over 4MB. Use a smaller file or paste a URL.`);
        continue;
      }
      const dataUrl = await fileToDataUrl(f);
      const item: MediaItem = {
        id: uid(),
        name: f.name,
        type: f.type.startsWith("video") ? "video" : "image",
        dataUrl,
        uploadedAt: Date.now(),
      };
      setSettings((s) => ({ ...s, media: [item, ...s.media] }));
      onChange(dataUrl);
      setOpen(false);
      return;
    }
  };

  const filtered = settings.media.filter((m) =>
    accept === "any" ? true : m.type === accept,
  );

  const isVideo = value && (value.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(value));

  return (
    <div>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {label}
        </span>
      )}
      <div className="flex items-stretch gap-3">
        <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
          {value ? (
            isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-400">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1 right-1 grid place-items-center h-6 w-6 rounded-full bg-white/90 shadow text-slate-700 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" /> Upload / Pick
          </button>
          <input
            type="text"
            value={value && !value.startsWith("data:") ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="…or paste URL"
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Media Library</h3>
              <button onClick={() => setOpen(false)} className="grid place-items-center h-8 w-8 rounded-full hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 flex flex-wrap gap-2 items-center">
              <input ref={fileRef} type="file" accept={acceptStr} className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <button onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-700">
                <Upload className="h-4 w-4" /> Upload new
              </button>
              <div className="flex-1" />
              <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste URL and press Use"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-72" />
              <button
                onClick={() => { if (urlInput) { onChange(urlInput); setOpen(false); } }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                Use URL
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">No media yet. Upload your first file.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filtered.map((m) => (
                    <div key={m.id} className="group relative rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                      {m.type === "video" ? (
                        <div className="relative h-full w-full">
                          <video src={m.dataUrl} className="h-full w-full object-cover" muted />
                          <Film className="absolute top-1 left-1 h-4 w-4 text-white drop-shadow" />
                        </div>
                      ) : (
                        <img src={m.dataUrl} alt={m.name} className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={() => { onChange(m.dataUrl); setOpen(false); }}
                        className="absolute inset-0 grid place-items-center bg-black/0 hover:bg-black/40 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
                      >
                        Use this
                      </button>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, media: s.media.filter((x) => x.id !== m.id) }))}
                        className="absolute top-1 right-1 grid place-items-center h-6 w-6 rounded-full bg-white/90 text-rose-600 shadow opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Upload, Check } from "lucide-react";
import {
  defaultSettings,
  loadSettings,
  resetSettings,
  saveSettings,
  type MediCareSettings,
} from "@/lib/medicareSettings";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

const MediCareAdmin = () => {
  const [s, setS] = useState<MediCareSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = "MediCare — Admin Settings";
    setS(loadSettings());
  }, []);

  const update = (patch: Partial<MediCareSettings>) =>
    setS((prev) => ({ ...prev, ...patch }));

  const onLogo = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      update({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onReset = () => {
    if (!confirm("Reset all MediCare settings to defaults?")) return;
    resetSettings();
    setS(defaultSettings);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor-portal"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
            <h1 className="font-semibold text-base sm:text-lg">
              MediCare Admin
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3.5 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <p className="text-sm text-slate-600">
          This admin is open to anyone — changes are stored on your device and
          instantly reflected on the Doctor Portal.
        </p>

        {/* Branding */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">Branding</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Website name">
              <input
                className={inputCls}
                value={s.siteName}
                onChange={(e) => update({ siteName: e.target.value })}
              />
            </Field>
            <Field label="Logo (PNG / SVG / JPG)">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm cursor-pointer hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onLogo(e.target.files?.[0])}
                  />
                </label>
                {s.logoDataUrl && (
                  <>
                    <img
                      src={s.logoDataUrl}
                      alt="Logo preview"
                      className="h-10 w-10 rounded-lg object-contain border border-slate-200 bg-white"
                    />
                    <button
                      onClick={() => update({ logoDataUrl: null })}
                      className="text-xs text-slate-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </Field>
            <Field label="Primary color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.primaryColor}
                  onChange={(e) => update({ primaryColor: e.target.value })}
                  className="h-10 w-14 rounded-lg border border-slate-200 bg-white cursor-pointer"
                />
                <input
                  className={inputCls}
                  value={s.primaryColor}
                  onChange={(e) => update({ primaryColor: e.target.value })}
                />
              </div>
            </Field>
            <Field label="Accent color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  className="h-10 w-14 rounded-lg border border-slate-200 bg-white cursor-pointer"
                />
                <input
                  className={inputCls}
                  value={s.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                />
              </div>
            </Field>
          </div>
        </section>

        {/* Hero / Home */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">Home (Hero)</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Eyebrow text">
              <input
                className={inputCls}
                value={s.hero.eyebrow}
                onChange={(e) =>
                  update({ hero: { ...s.hero, eyebrow: e.target.value } })
                }
              />
            </Field>
            <Field label="CTA button label">
              <input
                className={inputCls}
                value={s.hero.ctaLabel}
                onChange={(e) =>
                  update({ hero: { ...s.hero, ctaLabel: e.target.value } })
                }
              />
            </Field>
            <Field label="Headline (lead)">
              <input
                className={inputCls}
                value={s.hero.titleLead}
                onChange={(e) =>
                  update({ hero: { ...s.hero, titleLead: e.target.value } })
                }
              />
            </Field>
            <Field label="Headline (highlight)">
              <input
                className={inputCls}
                value={s.hero.titleHighlight}
                onChange={(e) =>
                  update({
                    hero: { ...s.hero, titleHighlight: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Subtitle">
                <textarea
                  rows={3}
                  className={inputCls}
                  value={s.hero.subtitle}
                  onChange={(e) =>
                    update({ hero: { ...s.hero, subtitle: e.target.value } })
                  }
                />
              </Field>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">About Us</h2>
          <div className="grid gap-5">
            <Field label="About title">
              <input
                className={inputCls}
                value={s.about.title}
                onChange={(e) =>
                  update({ about: { ...s.about, title: e.target.value } })
                }
              />
            </Field>
            <Field label="About body">
              <textarea
                rows={5}
                className={inputCls}
                value={s.about.body}
                onChange={(e) =>
                  update({ about: { ...s.about, body: e.target.value } })
                }
              />
            </Field>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email">
              <input
                className={inputCls}
                value={s.contact.email}
                onChange={(e) =>
                  update({ contact: { ...s.contact, email: e.target.value } })
                }
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputCls}
                value={s.contact.phone}
                onChange={(e) =>
                  update({ contact: { ...s.contact, phone: e.target.value } })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address / location">
                <input
                  className={inputCls}
                  value={s.contact.address}
                  onChange={(e) =>
                    update({
                      contact: { ...s.contact, address: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="font-semibold text-lg mb-4">Footer</h2>
          <Field label="Footer tagline">
            <textarea
              rows={2}
              className={inputCls}
              value={s.footerTagline}
              onChange={(e) => update({ footerTagline: e.target.value })}
            />
          </Field>
        </section>

        <div className="flex justify-end pb-12">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default MediCareAdmin;

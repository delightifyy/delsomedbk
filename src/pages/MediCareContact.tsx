import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiError, api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";
import { useMediCareSettings } from "@/lib/medicareSettings";
import { MedicareFooter, MedicareSimpleHeader, medicareThemeStyle } from "@/components/medicare/MediCareChrome";

type StateOption = {
  id: string;
  name: string;
};

const tokenStyles = `
.medicare-contact {
  --mc-primary: 212 88% 32%;
  --mc-accent: 174 72% 42%;
  --mc-bg: 210 40% 99%;
  --mc-fg: 222 47% 11%;
  --mc-muted: 215 16% 47%;
  --mc-border: 215 25% 90%;
  --mc-card: 0 0% 100%;
  --mc-ink: 222 47% 11%;
  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-contact h1, .medicare-contact h2, .medicare-contact h3, .medicare-contact h4 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: -0.01em;
}
.mc-contact-card {
  background: hsl(var(--mc-card));
  border: 1px solid hsl(var(--mc-border));
  box-shadow: 0 18px 40px -30px hsl(var(--mc-primary) / .45);
}
.mc-contact-input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid hsl(var(--mc-border));
  background: white;
  padding: .8rem 1rem;
  color: hsl(var(--mc-ink));
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.mc-contact-input:focus {
  border-color: hsl(var(--mc-primary));
  box-shadow: 0 0 0 4px hsl(var(--mc-primary) / .12);
}
`;

const fieldErrors = (error: unknown) => {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : "Please try again.";
  if (!Array.isArray(error.errors)) return error.message;

  const messages = error.errors
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const record = entry as Record<string, unknown>;
      return [record.field, record.message].filter(Boolean).join(": ");
    })
    .filter(Boolean);

  return messages.length ? messages.join(" ") : error.message;
};

const ContactCard = ({
  icon,
  label,
  title,
  body,
  href,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  body?: string;
  href?: string;
}) => {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--mc-muted))]">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-[hsl(var(--mc-ink))]">{title}</p>
      {body && <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--mc-muted))]">{body}</p>}
    </>
  );

  return (
    <div className="mc-contact-card flex items-start gap-4 rounded-2xl p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[hsl(var(--mc-primary)/.1)] text-[hsl(var(--mc-primary))]">
        {icon}
      </span>
      <div>
        {href ? (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
            {content}
          </a>
        ) : content}
      </div>
    </div>
  );
};

const normalizePhone = (phone: string) => phone.replace(/[^\d]/g, "");

const MediCareContact = ({ doctorSlug }: { doctorSlug?: string } = {}) => {
  const settings = useMediCareSettings(doctorSlug);
  const basePath = doctorSlug ? "" : "/doctor-portal";
  const homeHref = basePath || "/";
  const activeHref = `${basePath}/contact` || "/contact";
  const themeStyle = useMemo(
    () => medicareThemeStyle(settings),
    [settings.primaryColor, settings.accentColor],
  );
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [states, setStates] = useState<StateOption[]>([]);
  const [stateId, setStateId] = useState("");

  useEffect(() => {
    document.title = `Contact Us - ${settings.siteName || "MediCare"}`;
  }, [settings.siteName]);

  useEffect(() => {
    let cancelled = false;
    api.lookups.states()
      .then((response) => {
        if (cancelled) return;
        setStates(
          collection(response.data)
            .map((entry: any) => ({
              id: String(entry?.id ?? entry?.uuid ?? ""),
              name: String(entry?.name ?? entry?.title ?? ""),
            }))
            .filter((entry) => entry.id && entry.name),
        );
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      full_name: String(fd.get("full_name") || "").trim(),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || "").trim() || undefined,
      state_id: stateId ? Number(stateId) : undefined,
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
    };

    setBusy(true);
    try {
      await api.contact.submit(payload);
      toast({ title: "Message sent", description: "Our team will get back to you within one business day." });
      form.reset();
      setStateId("");
    } catch (error) {
      toast({ title: "Unable to send message", description: fieldErrors(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const email = settings.contact.email || "enquiry@desolmed.com";
  const phone = settings.contact.phone || "+234 818 689 9594";
  const address = settings.contact.address || "10, Abeokuta Street, Ebute Metta, Yaba, Lagos, Nigeria";
  const whatsappNumber = normalizePhone(phone) || "2348186899594";

  return (
    <div className="medicare-contact min-h-screen" style={themeStyle}>
      <style>{tokenStyles}</style>
      <MedicareSimpleHeader settings={settings} activeHref={activeHref} basePath={basePath} />

      <section className="border-b border-[hsl(var(--mc-border))] bg-[linear-gradient(135deg,hsl(var(--mc-primary)/.08),hsl(var(--mc-accent)/.08))]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Link to={homeHref} className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--mc-muted))] transition hover:text-[hsl(var(--mc-primary))]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--mc-muted))] sm:text-lg">
            Whether you are a patient, doctor, organization, or HMO, the MediCare team is here to help.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12">
        <div className="mc-contact-card rounded-3xl p-6 sm:p-8 lg:col-span-7">
          <h2 className="font-display text-2xl font-bold">Send us a message</h2>
          <p className="mt-1 text-sm text-[hsl(var(--mc-muted))]">We typically respond within one business day.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Full Name
              <input className="mc-contact-input" name="full_name" required maxLength={150} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input className="mc-contact-input" name="email" type="email" required maxLength={255} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Phone
              <input className="mc-contact-input" name="phone" type="tel" maxLength={30} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              State
              <select className="mc-contact-input" value={stateId} onChange={(event) => setStateId(event.target.value)}>
                <option value="">Select a state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Subject
              <input className="mc-contact-input" name="subject" required maxLength={200} />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Message
              <textarea className="mc-contact-input min-h-36 resize-y" name="message" required maxLength={5000} placeholder="Tell us a bit more..." />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--mc-primary))] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_hsl(var(--mc-primary))] transition hover:opacity-95 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {busy ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <ContactCard icon={<Mail className="h-5 w-5" />} label="Email us" title={email} body="For general enquiries" href={`mailto:${email}`} />
          <ContactCard icon={<Phone className="h-5 w-5" />} label="Call us" title={phone} body="Primary contact" href={`tel:${normalizePhone(phone)}`} />
          <ContactCard icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" title={phone} body="Direct message us" href={`https://wa.me/${whatsappNumber}`} />
          <ContactCard icon={<MapPin className="h-5 w-5" />} label="Visit us" title="Ebute Metta" body={address} />
          <ContactCard icon={<MapPin className="h-5 w-5" />} label="Visit us" title="Abijo" body="12, Balogun Estate Rd, Opp. Fara Park, Abijo, Ibeju-Lekki, Lagos, Nigeria" />
          <div className="mc-contact-card rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--mc-primary))]" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--mc-muted))]">Office Hours</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-4"><span>Monday - Friday</span><span className="text-[hsl(var(--mc-muted))]">8:00 - 18:00</span></li>
              <li className="flex justify-between gap-4"><span>Saturday</span><span className="text-[hsl(var(--mc-muted))]">9:00 - 14:00</span></li>
              <li className="flex justify-between gap-4"><span>Sunday</span><span className="text-[hsl(var(--mc-muted))]">Helpline only</span></li>
            </ul>
          </div>
        </div>
      </section>

      <MedicareFooter settings={settings} basePath={basePath} />
    </div>
  );
};

export default MediCareContact;

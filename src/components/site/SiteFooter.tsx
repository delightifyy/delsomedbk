import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Stethoscope, ArrowRight, Heart, Building2 } from "lucide-react";
import desolmedLogo from "@/assets/desolmed-logo.png";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

const DOCTOR_PORTAL_PATH = "/doctor-portal";

export const SiteFooter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.newsletter.subscribe({ email: email.trim() });
      setMessage("Check your email to confirm.");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not subscribe right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="border-t border-border bg-card mt-16 sm:mt-24">
      {/* Portals access strip */}
      {/* <div className="border-b border-border bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/30">
        <div className="container py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Portals</p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1">Sign in to your workspace</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">Secure, role-based access for patients, doctors and organizations.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { to: "/patient", label: "Patient Portal", desc: "Appointments, records & prescriptions", icon: Heart },
              { to: "/doctor", label: "Doctor Portal", desc: "EMR, consultations & patients", icon: Stethoscope },
              { to: "/organization", label: "Organization / HMO", desc: "Staff, usage & billing", icon: Building2 },
            ].map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="group relative overflow-hidden rounded-xl border border-border bg-background p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/[0.04] group-hover:to-secondary/40 transition-colors" />
                <div className="relative flex items-start gap-4">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-base">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div> */}

      <div className="container py-12 sm:py-16 grid gap-10 grid-cols-2 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={desolmedLogo}
              alt="DesolMed logo"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-sm"
            />
            <span className="font-display text-2xl sm:text-3xl font-black leading-none">
              <span className="text-primary">Desol</span><span className="text-secondary">Med</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            A medical network solution to telemedicine, EMR, and referral system built on trust, transparency, and standard care, connecting Nigerians to verified healthcare professionals across and outside Nigeria.
          </p>
          {/* <form onSubmit={subscribe} className="max-w-sm rounded-xl border border-border bg-background/70 p-3">
            <p className="text-xs font-semibold text-foreground">Newsletter</p>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <button
                disabled={busy}
                className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "..." : "Join"}
              </button>
            </div>
            {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
          </form> */}
          <ul className="space-y-2 text-sm text-muted-foreground pt-2">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" /> <a href="mailto:enquiry@desolmed.com" className="hover:text-foreground transition-colors">enquiry@desolmed.com</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" /> <a href="tel:+2348186899594" className="hover:text-foreground transition-colors">+234 818 689 9594</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" /> <a href="tel:+2348165595677" className="hover:text-foreground transition-colors">+234 816 559 5677</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-secondary" /> <a href="https://wa.me/2348186899594" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">WhatsApp</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" /> Lagos, Nigeria</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-display text-sm font-semibold mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/doctors" className="hover:text-foreground transition-colors">Find a Doctor</Link></li>
            <li><Link to="/blogs" className="hover:text-foreground transition-colors">News</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-display text-sm font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/doctors" className="hover:text-foreground transition-colors">All doctors</Link></li>
            <li><Link to="/adverts" className="hover:text-foreground transition-colors">Health Adverts</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">About DesolMed</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Talk to our team</Link></li>
            <li><Link to={DOCTOR_PORTAL_PATH} className="inline-flex items-center gap-1 text-primary font-semibold hover:text-secondary transition-colors">Doctor Portal <ArrowRight className="h-3 w-3" /></Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h4 className="font-display text-sm font-semibold mb-4">Join</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/register?type=doctor" className="hover:text-foreground transition-colors">As a Doctor</Link></li>
            <li><Link to="/register/patient" className="hover:text-foreground transition-colors">As a Patient</Link></li>
            <li><Link to="/register?type=organization" className="hover:text-foreground transition-colors">As an HMO/Organization</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2 md:text-right md:ml-auto">
          <h4 className="font-display text-sm font-semibold mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-5 text-xs text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-center md:text-left w-full md:w-auto">
              <p className="">© {new Date().getFullYear()} DesolMed. All rights reserved.</p>
            </div>
            <div className="w-full md:w-auto">
              <ul className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-end gap-2 md:gap-x-5">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

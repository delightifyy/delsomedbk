import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionLabel } from "@/components/site/SectionLabel";
import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { NIGERIA_STATES } from "@/data/nigeriaStates";
import { addContactMessage } from "@/lib/localStore";

const Contact = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    setBusy(true);
    await addContactMessage({
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
      state: String(fd.get("state") || "") || null,
    });
    setBusy(false);
    toast({ title: "Message sent", description: "Our team will get back to you within one business day." });
    form.reset();
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container py-16 max-w-3xl">
          <SectionLabel number="" label="Contact" />
          <h1 className="mt-3 font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-balance">
            We'd love to hear from you.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Whether you're a patient, doctor, organization or HMO — our team is here to help.
          </p>
        </div>
      </section>

      <section className="container py-16 grid lg:grid-cols-12 gap-10">
        {/* Form left */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold">Send Us a Message</h2>
          <p className="text-sm text-muted-foreground mt-1">We typically respond within one business day.</p>
          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select name="state">
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {NIGERIA_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required maxLength={150} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required maxLength={1000} rows={6} placeholder="Tell us a bit more…" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" variant="hero" size="lg" disabled={busy}>
                <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary flex-shrink-0">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs tracking-wider text-muted-foreground">Email us</p>
              <a href="mailto:enquiry@desolmed.com" className="font-display font-semibold mt-0.5 hover:text-primary transition-colors text-foreground">enquiry@desolmed.com</a>
              <p className="text-xs text-muted-foreground mt-0.5">For general enquiries</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary flex-shrink-0">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs tracking-wider text-muted-foreground">Call us</p>
              <a href="tel:+2348186899594" className="font-display font-semibold mt-0.5 hover:text-primary transition-colors text-foreground">+234 818 689 9594</a>
              <p className="text-xs text-muted-foreground mt-0.5">Primary contact</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary flex-shrink-0">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs tracking-wider text-muted-foreground">Call us</p>
              <a href="tel:+2348165595677" className="font-display font-semibold mt-0.5 hover:text-primary transition-colors text-foreground">+234 816 559 5677</a>
              <p className="text-xs text-muted-foreground mt-0.5">Alternative line</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-green-500/10 text-green-600 flex-shrink-0">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs tracking-wider text-muted-foreground">WhatsApp</p>
              <a href="https://wa.me/2348186899594" target="_blank" rel="noopener noreferrer" className="font-display font-semibold mt-0.5 hover:text-green-700 transition-colors text-green-600">+234 818 689 9594</a>
              <p className="text-xs text-muted-foreground mt-0.5">Direct message us</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h4 className="font-display font-semibold text-sm mb-3">Visit Us</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">Ebute Metta</p>
                <p className="text-muted-foreground text-xs leading-relaxed">10, Abeokuta Street<br/>Ebute Metta, Yaba<br/>Lagos, Nigeria</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Abijo</p>
                <p className="text-muted-foreground text-xs leading-relaxed">12, Balogun Estate Rd<br/>Opp. Fara Park<br/>Abijo, Ibeju-Lekki<br/>Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          {/* Office hours */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-secondary" />
              <p className="text-xs tracking-wider text-muted-foreground font-semibold">Office Hours</p>
            </div>
            <ul className="space-y-1.5 text-sm">
              <li className="flex justify-between"><span>Monday – Friday</span><span className="text-muted-foreground">8:00 — 18:00</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="text-muted-foreground">9:00 — 14:00</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="text-muted-foreground">Helpline only</span></li>
            </ul>
          </div>

        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;

import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DualCta } from "@/components/site/DualCta";

const CookiePolicy = () => (
  <SiteLayout>
    <section className="border-b border-border bg-muted/30">
      <div className="container py-16 lg:py-24 max-w-4xl">
        <SectionLabel number="" label="Legal" />
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-balance">
          Cookie Policy
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          This policy explains how DesolMed uses cookies and similar technologies, and how you can accept or reject non-essential cookies.
        </p>
        <p className="mt-4 text-sm text-muted-foreground font-medium">
          Effective Date: May 2, 2026
        </p>
      </div>
    </section>

    <section className="container py-20 max-w-4xl">
      <div className="space-y-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            Desol Medical Solutions Ltd uses essential cookies and similar browser storage to make the Website function correctly, remember preferences, and support core features. Non-essential cookies will only be used when you choose to accept them.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-4">1. What Cookies Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files placed on your device by websites you visit. Similar technologies may include local storage, session storage, or device identifiers used for related purposes.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-4">2. Types of Cookies We May Use</h2>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3"><span className="text-primary font-bold">•</span><span><strong>Essential cookies</strong> — required for the Website to function and remember your consent choice</span></li>
            <li className="flex gap-3"><span className="text-primary font-bold">•</span><span><strong>Preference cookies</strong> — remember display settings and preferences</span></li>
            <li className="flex gap-3"><span className="text-primary font-bold">•</span><span><strong>Analytics cookies</strong> — help us understand usage and improve the Website, only if enabled</span></li>
            <li className="flex gap-3"><span className="text-primary font-bold">•</span><span><strong>Third-party cookies</strong> — may be used by embedded services, only where needed and permitted</span></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-4">3. Accept or Reject</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you first visit the Website, you can choose to accept or reject non-essential cookies using the consent banner. Essential cookies will always be active to ensure the Website functions properly. Your choice will be remembered for future visits.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-4">4. Managing Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can also control cookies through your browser settings. Blocking some cookies may affect how parts of the Website work.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold mb-6">5. Contact</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><span className="font-semibold text-foreground">Email:</span> <a href="mailto:enquiry@desolmed.com" className="text-primary hover:underline">enquiry@desolmed.com</a></p>
            <p><span className="font-semibold text-foreground">Website:</span> https://desolmed.com/</p>
          </div>
        </div>
      </div>
    </section>

    <section className="container py-20">
      <DualCta />
    </section>
  </SiteLayout>
);

export default CookiePolicy;
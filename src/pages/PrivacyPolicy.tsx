import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DualCta } from "@/components/site/DualCta";

const PrivacyPolicy = () => (
  <SiteLayout>
    {/* Hero */}
    <section className="border-b border-border bg-muted/30">
      <div className="container py-16 lg:py-24 max-w-4xl">
        <SectionLabel number="" label="Legal" />
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-balance">
          Privacy Policy
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
        </p>
        <p className="mt-4 text-sm text-muted-foreground font-medium">
          Effective Date: May 2, 2026
        </p>
      </div>
    </section>

    {/* Content */}
    <section className="container py-20 max-w-4xl">
      <div className="prose prose-sm max-w-none space-y-8">
        {/* Intro */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            <strong>Desol Medical Solutions Ltd</strong> ("we," "our," or "us") operates <strong>https://desolmed.com/</strong> (the "Website"). This policy explains how we collect, use, and protect your information when you use our Website and services.
          </p>
        </div>

        {/* Section 1 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">We may collect:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Personal details</strong> — name, email, phone number submitted via forms</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Health-related information</strong> — you voluntarily provide for healthcare purposes</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Technical data</strong> — IP address, browser type, device information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Website usage data</strong> — pages visited, interactions, time spent</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">We use your data to:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Respond to inquiries and provide customer support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Deliver healthcare-related services where applicable</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Improve website performance and user experience</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Meet legal and regulatory requirements</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">3. Health Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Any health-related information you provide is treated as confidential and we comply with relevant healthcare regulations. This information is used only for the purpose of delivering or supporting healthcare services and is protected by appropriate safeguards.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">4. Legal Basis for Processing</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">We process your data under the following legal bases:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Your consent</strong> — when you provide it</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Provision of services</strong> — to fulfill our contract with you</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Legal obligations</strong> — to comply with applicable laws</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Legitimate interests</strong> — such as improving services and fraud prevention</span>
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">5. Data Sharing</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">We may share your data with:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Qualified healthcare professionals</strong> — involved in your care when applicable</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Service providers</strong> — hosting providers, analytics services, IT support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span><strong>Authorities</strong> — where legally required by law</span>
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 font-semibold">We do not sell your data to third parties.</p>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">6. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organizational safeguards to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your information only as long as necessary for service delivery, legal compliance, or as required by applicable regulations. When your data is no longer needed, we will securely delete or anonymize it.
          </p>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">8. Your Rights</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">You may have the right to:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Access your personal data and receive a copy</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Request correction or deletion of inaccurate data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Withdraw your consent at any time</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Object to processing of your data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Request data portability in machine-readable format</span>
            </li>
          </ul>
          <p className="text-muted-foreground mt-4">To exercise these rights, contact us using the details below.</p>
        </div>

        {/* Section 9 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">9. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies and similar browser storage to keep the Website working properly and to remember preferences such as consent choices. Any optional cookies for analytics or marketing will be subject to your choice through our cookie banner. You can review the full details in our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
        </div>

        {/* Section 10 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">10. Third-Party Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Website may contain links to external websites. We are not responsible for the privacy practices, content, or security of third-party websites. We recommend reviewing their privacy policies before sharing any information.
          </p>
        </div>

        {/* Section 11 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">11. Policy Updates</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this privacy policy periodically to reflect changes in our practices or applicable laws. Updates will be posted on this page with the new effective date. Your continued use of our Website constitutes acceptance of the updated policy.
          </p>
        </div>

        {/* Section 12 */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold mb-6">12. Contact Us</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Email:</p>
              <a href="mailto:enquiry@desolmed.com" className="text-primary hover:underline">
                enquiry@desolmed.com
              </a>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Phone:</p>
              <div className="space-y-1">
                <a href="tel:+2348186899594" className="block text-primary hover:underline">
                  +234 818 689 9594
                </a>
                <a href="tel:+2348165595677" className="block text-primary hover:underline">  
                  +234 816 559 5677
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Addresses:</p>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Ebute Metta</p>
                  <p className="text-sm">10, Abeokuta Street<br/>Ebute Metta, Yaba<br/>Lagos, Nigeria</p>
                </div>
                <div>
                  <p className="font-medium">Abijo</p>
                  <p className="text-sm">12, Balogun Estate Rd<br/>Opp. Fara Park<br/>Abijo, Ibeju-Lekki<br/>Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="rounded-2xl border border-border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          <p>
            If you have concerns about how we handle your data, you may have the right to lodge a complaint with your local data protection authority.
          </p>
        </div>
      </div>
    </section>

    <section className="container py-20">
      <DualCta />
    </section>
  </SiteLayout>
);

export default PrivacyPolicy;

import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionLabel } from "@/components/site/SectionLabel";
import { DualCta } from "@/components/site/DualCta";

const TermsAndConditions = () => (
  <SiteLayout>
    {/* Hero */}
    <section className="border-b border-border bg-muted/30">
      <div className="container py-16 lg:py-24 max-w-4xl">
        <SectionLabel number="" label="Legal" />
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-balance">
          Terms & Conditions
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Please read these terms carefully before using our Website. By accessing and using this Website, you agree to comply with these terms.
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
            <strong>Desol Medical Solutions Ltd</strong> ("we," "our," "us," or "Company") operates <strong>https://desolmed.com/</strong> (the "Website"). By using this Website, you agree to comply with and be bound by these Terms and Conditions.
          </p>
        </div>

        {/* Section 1 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">1. Website Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            This Website provides general information about healthcare services, connects users with healthcare professionals, and allows users to make inquiries or access support. The Website is intended for informational purposes and to facilitate healthcare consultations where applicable.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">2. No Medical Advice</h2>
          <p className="text-muted-foreground leading-relaxed">
            Content on this Website, including articles, information, and resources, is provided for informational purposes only and is not medical advice. This content should not be used as a substitute for professional medical consultation with a qualified healthcare professional. Always consult with a licensed medical practitioner before making any healthcare decisions.
          </p>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">3. Use of Services</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">When you submit information through this Website, you agree to the following:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>All information you provide is accurate, truthful, and complete</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>You consent to being contacted by our team regarding your inquiry</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>You understand that services may be subject to additional terms and conditions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>You acknowledge our right to verify the information you provide</span>
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">4. No Doctor-Patient Relationship</h2>
          <p className="text-muted-foreground leading-relaxed">
            Using this Website does not automatically establish a doctor-patient relationship unless explicitly confirmed through a formal consultation process with a qualified healthcare provider. A doctor-patient relationship is only established when a registered healthcare professional explicitly agrees to provide you with medical care, after which applicable healthcare regulations and confidentiality agreements apply.
          </p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">5. User Conduct</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">You agree not to:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Misuse the Website for illegal or harmful purposes</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Attempt unauthorized access or hacking the Website</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Submit false, fraudulent, or harmful information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Engage in harassment, abusive behavior, or discrimination</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Transmit viruses or malicious code</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Violate any applicable laws or regulations</span>
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">6. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on this Website, including text, images, graphics, videos, logos, and design elements, is owned by Desol Medical Solutions Ltd or its content providers and is protected by applicable copyright laws. You may not reproduce, distribute, modify, or transmit any website content without prior written permission from Desol Medical Solutions Ltd. Unauthorized use of our intellectual property may result in legal action.
          </p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">7. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">To the maximum extent permitted by law, Desol Medical Solutions Ltd is not liable for:</p>
          <ul className="space-y-2.5 text-muted-foreground pl-6">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Any decisions or actions taken based on Website content</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Service interruptions, errors, or technical failures</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Lost data, revenue, or business opportunities</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Indirect, incidental, or consequential damages</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Medical outcomes or healthcare decisions</span>
            </li>
          </ul>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">8. Third-Party Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Website may contain links to third-party websites or services. We do not control these external links and are not responsible for their content, accuracy, or privacy practices. We recommend reviewing the terms and privacy policies of any third-party websites before providing them with your information. Your use of third-party websites is at your own risk.
          </p>
        </div>

        {/* Section 9 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">9. Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your use of this Website is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which outlines how we collect, use, and protect your information. By using the Website, you consent to the practices described in our Privacy Policy.
          </p>
        </div>

        {/* Section 10 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">10. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms and Conditions are governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions. Any disputes arising from your use of this Website shall be subject to the exclusive jurisdiction of the courts of the United Kingdom.
          </p>
        </div>

        {/* Section 11 */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">11. Updates to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these Terms and Conditions at any time without prior notice. Changes will be posted on this page with an updated effective date. Your continued use of the Website after any modifications constitutes your acceptance of the updated Terms. We encourage you to review these Terms periodically to stay informed of any changes.
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
            If you have any questions about these Terms and Conditions, or if you do not agree with any part of them, please do not use this Website and contact us immediately.
          </p>
        </div>
      </div>
    </section>

    <section className="container py-20">
      <DualCta />
    </section>
  </SiteLayout>
);

export default TermsAndConditions;

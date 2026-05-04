import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Stethoscope, ExternalLink } from "lucide-react";
import desolmedLogo from "@/assets/desolmed-logo.png";

const DOCTOR_PORTAL_URL = "https://portal.desolmed.com";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-card mt-16 sm:mt-24">
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
            {/* <div className="w-full md:w-auto">
              <ul className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-end gap-2 md:gap-x-5">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Admin</Link></li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

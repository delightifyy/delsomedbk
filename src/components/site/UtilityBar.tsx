import { Link } from "react-router-dom";
import { Phone, Globe, Building2, LogIn } from "lucide-react";

export const UtilityBar = () => {
  return (
    <div className="hidden md:block bg-primary text-primary-foreground/90 text-xs">
      <div className="container flex h-9 items-center justify-between">
        <div className="flex items-center gap-5">
          <a href="tel:+2348000000000" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <Phone className="h-3.5 w-3.5" /> 24/7 helpline · +234 800 000 0000
          </a>
          <span className="flex items-center gap-1.5 text-primary-foreground/70">
            <Globe className="h-3.5 w-3.5" /> NG · English
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/register?type=organization" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <Building2 className="h-3.5 w-3.5" /> For HMOs & Organizations
          </Link>
          <Link to="/register/patient" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <LogIn className="h-3.5 w-3.5" /> Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

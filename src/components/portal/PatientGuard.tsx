import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasPatientAccess } from "@/lib/authRoles";

export const PatientGuard = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || isAdmin || !hasPatientAccess(user)) {
    return <Navigate to={`/patient/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
};

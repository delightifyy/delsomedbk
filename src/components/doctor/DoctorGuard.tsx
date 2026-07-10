import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DOCTOR_ROLES = new Set(["doctor", "physician", "provider", "consultant"]);
const ADMIN_ROLES = new Set(["admin", "super_admin", "administrator"]);

const hasRole = (roles: string[] | undefined, allowed: Set<string>) =>
  Boolean(roles?.some((role) => allowed.has(String(role).toLowerCase())));

export const DoctorGuard = ({ children }: { children: ReactNode }) => {
  const { user, session, isAdmin, loading } = useAuth();
  const location = useLocation();

  const userRoles = user?.roles?.map((role) => String(role).toLowerCase()) ?? [];
  const sessionRoles = session?.roles?.map((role) => String(role).toLowerCase()) ?? [];
  const roles = [...new Set([...userRoles, ...sessionRoles])];

  const hasDoctorRole =
    hasRole(roles, DOCTOR_ROLES) ||
    user?.user_type === "doctor" ||
    user?.role === "doctor" ||
    user?.is_doctor === true;

  const hasAdminRole =
    isAdmin ||
    hasRole(roles, ADMIN_ROLES) ||
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.is_admin === true;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasDoctorRole && !hasAdminRole) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/doctor/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
};

export default DoctorGuard;

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="font-display text-2xl font-bold">Admin access required</h1>
          <p className="text-muted-foreground text-sm">
            Your account is signed in but doesn't have admin privileges. Ask an existing admin to grant you the
            <span className="px-1 mx-1 rounded bg-muted">admin</span> role in the local users list.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

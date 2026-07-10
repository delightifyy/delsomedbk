import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Loader2, LockKeyhole, Mail, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  ApiError,
  clearApiAuthState,
  extractAuthPayload,
  normalizeRoleList,
  setStoredAuthToken,
  setStoredAuthUser,
  type AuthLoginPayload,
} from "@/lib/api";
import { setStoredSession, type LocalSession } from "@/lib/localStore";

const MINI_SITE_ROLES = new Set(["doctor", "provider", "consultant", "admin", "super_admin", "mini_site_admin"]);

const hasMiniSiteAccess = (
  user: any | null | undefined,
  session: LocalSession | null | undefined,
  isAdmin?: boolean,
) => {
  const roles = [
    ...(user?.roles ?? []),
    ...(session?.roles ?? []),
  ].map((role) => String(role).toLowerCase());

  return (
    isAdmin === true ||
    roles.some((role) => MINI_SITE_ROLES.has(role)) ||
    user?.user_type === "doctor" ||
    user?.role === "doctor" ||
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.is_doctor === true ||
    user?.is_admin === true
  );
};

const buildMiniSiteSession = (
  email: string,
  payload: AuthLoginPayload,
): LocalSession => {
  const user = payload.user ?? {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const roles = normalizeRoleList(user.roles ?? payload.roles);

  if (user.user_type === "doctor" || user.is_doctor === true) {
    roles.push("doctor");
  }
  if (user.is_admin === true || user.role === "admin" || user.role === "super_admin") {
    roles.push("admin");
  }
  if (!roles.includes("mini_site_admin")) roles.push("mini_site_admin");

  const normalizedUser = {
    id: String(user.uuid ?? user.id ?? email),
    uuid: String(user.uuid ?? user.id ?? email),
    email: user.email ?? email,
    name: fullName || user.full_name || user.name || null,
    role: user.role ?? user.user_type ?? "mini_site_admin",
    user_type: user.user_type,
    is_admin: user.is_admin === true || user.role === "admin" || user.role === "super_admin",
    is_doctor: user.is_doctor === true || user.user_type === "doctor",
    roles,
  };

  setStoredAuthUser(normalizedUser);

  return {
    user: {
      id: normalizedUser.uuid,
      email: normalizedUser.email,
      full_name: normalizedUser.name,
      created_at: user.created_at ?? new Date().toISOString(),
      role: normalizedUser.role,
    } as LocalSession["user"],
    token: payload.token,
    roles,
    token_type: payload.token_type,
    expires_in: payload.expires_in,
  };
};

const signInMiniSiteAdmin = async (email: string, password: string) => {
  const response = await api.auth.doctorCmsLogin({ email, password });
  const payload = extractAuthPayload(response);
  if (!payload.token) throw new Error("Login succeeded but no access token was returned.");
  return payload;
};

const loginErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Invalid email or password.";
    if (error.status === 403) return "This account does not have access to this mini-site admin.";
    if (error.status === 0) return "Cannot connect to the API server. Please check your connection.";
    return error.message;
  }

  return error instanceof Error ? error.message : "Unable to sign in. Please try again.";
};

export const MiniSiteAdminGate = ({
  children,
  siteName = "Mini-site",
}: {
  children: ReactNode;
  siteName?: string;
}) => {
  const { user, session, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const hasAccess = useMemo(
    () => unlocked || hasMiniSiteAccess(user, session, isAdmin),
    [isAdmin, session, unlocked, user],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      clearApiAuthState();
      const payload = await signInMiniSiteAdmin(trimmedEmail, password);
      const nextSession = buildMiniSiteSession(trimmedEmail, payload);

      setStoredAuthToken(payload.token);
      setStoredSession(nextSession);

      setUnlocked(true);

      toast({
        title: "Mini-site admin unlocked",
        description: "You can now manage this mini-site.",
      });
    } catch (loginError) {
      clearApiAuthState();
      const message = loginErrorMessage(loginError);
      setError(message);
      toast({
        title: "Mini-site login failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,.22),transparent_30%)]" />
      <div className="relative grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Login</p>
            <h1 className="mt-2 text-2xl font-bold">{siteName} Login</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in with the mini-site credentials sent in your approval email.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mini-site-email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="mini-site-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="doctor@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mini-site-password">Password</Label>
              <Input
                id="mini-site-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="Temporary password"
              />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              {busy ? "Signing in..." : "Open Mini-site Admin"}
            </Button>

            <div className="text-center">
              <Link
                to={`/forgot-password?context=mini-site&return=${encodeURIComponent("/admin")}${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`}
                className="text-xs text-slate-500 transition hover:text-teal-700"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <Link to="/" className="inline-flex items-center gap-1 transition hover:text-slate-900">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" />
              Doctor's Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniSiteAdminGate;

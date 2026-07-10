import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, LockKeyhole, Stethoscope } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  ApiError,
  extractAuthPayload,
  normalizeRoleList,
  setStoredAuthToken,
  setStoredAuthUser,
} from "@/lib/api";
import { setStoredSession, type LocalSession } from "@/lib/localStore";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const buildDoctorSession = (
  email: string,
  payload: ReturnType<typeof extractAuthPayload>,
  loginType: "doctor" | "super_admin",
): LocalSession => {
  const user = payload.user ?? {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const roles = normalizeRoleList(user.roles ?? payload.roles);

  if (loginType === "doctor" && !roles.includes("doctor")) roles.push("doctor");
  if (loginType === "super_admin") {
    if (!roles.includes("super_admin")) roles.push("super_admin");
    if (!roles.includes("admin")) roles.push("admin");
  }

  const normalizedUser = {
    id: String(user.uuid ?? user.id ?? email),
    uuid: String(user.uuid ?? user.id ?? email),
    email: user.email ?? email,
    name: fullName || user.full_name || user.name || null,
    role: loginType === "super_admin" ? "super_admin" : user.role ?? "doctor",
    user_type: user.user_type ?? (loginType === "doctor" ? "doctor" : undefined),
    is_admin: loginType === "super_admin" || user.is_admin === true,
    is_doctor: loginType === "doctor" || user.is_doctor === true,
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

const getLoginFailureMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 408) {
      return {
        title: "Connection timeout",
        description: "Server is taking too long to respond. Please try again.",
      };
    }

    if (error.status === 0) {
      return {
        title: "Connection error",
        description: "Cannot connect to the server. Please check your internet connection.",
      };
    }
  }

  return {
    title: "Login failed",
    description: "Invalid email or password. Please try again.",
  };
};

const isAdminPayload = (payload: ReturnType<typeof extractAuthPayload>) => {
  const user = payload.user ?? {};
  const role = String(user.role ?? user.user_type ?? "").toLowerCase();
  const roles = normalizeRoleList(user.roles ?? payload.roles);

  return (
    user.is_admin === true ||
    ["admin", "super_admin", "administrator"].includes(role) ||
    roles.some((entry) => ["admin", "super_admin", "administrator"].includes(entry))
  );
};

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session, isAdmin, loading, refetchUser } = useAuth();
  const { toast } = useToast();
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const redirect = useMemo(() => {
    const requested = searchParams.get("redirect") || "/doctor";
    return requested.startsWith("/doctor") && requested !== "/doctor/login" ? requested : "/doctor";
  }, [searchParams]);

  const hasDoctorAccess = useMemo(() => {
    const roles = [
      ...(user?.roles ?? []),
      ...(session?.roles ?? []),
    ].map((role) => String(role).toLowerCase());

    return (
      isAdmin ||
      roles.some((role) => ["doctor", "physician", "provider", "consultant", "admin", "super_admin"].includes(role)) ||
      user?.user_type === "doctor" ||
      user?.role === "doctor" ||
      user?.is_doctor === true
    );
  }, [isAdmin, session?.roles, user]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setEmailError(null);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (!loading && user && hasDoctorAccess) {
      navigate(redirect, { replace: true });
    }
  }, [hasDoctorAccess, loading, navigate, redirect, user]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    setEmailError(value && !isValidEmail(value) ? "Please enter a valid email address" : null);
  };

  const login = async (trimmedEmail: string, passwordValue: string) => {
    try {
      const doctorResponse = await api.auth.doctorLogin({ email: trimmedEmail, password: passwordValue });
      const doctorPayload = extractAuthPayload(doctorResponse);
      if (doctorPayload.token) return { payload: doctorPayload, loginType: "doctor" as const };
      throw new Error("Doctor login did not return an access token.");
    } catch (doctorError) {
      const adminResponse = await api.auth.adminLogin({ email: trimmedEmail, password: passwordValue });
      const adminPayload = extractAuthPayload(adminResponse);
      if (adminPayload.token && isAdminPayload(adminPayload)) {
        return { payload: adminPayload, loginType: "super_admin" as const };
      }
      throw doctorError;
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const { payload, loginType } = await login(trimmedEmail, password);
      const session = buildDoctorSession(trimmedEmail, payload, loginType);

      setStoredAuthToken(payload.token);
      setStoredSession(session);
      await refetchUser();

      toast({
        title: loginType === "super_admin" ? "Welcome Admin" : "Welcome Doctor",
        description: `You are now signed in to the doctor portal.`,
      });

      navigate(redirect, { replace: true });
    } catch (error) {
      const message = getLoginFailureMessage(error);
      toast({
        ...message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Doctor Portal</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Doctor Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your practice dashboard, manage appointments, and view patient records.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="doctor-email">Email Address</Label>
              <Input
                id="doctor-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                placeholder="doctor@practice.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "doctor-email-error" : undefined}
                className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {emailError && (
                <p id="doctor-email-error" className="mt-1 text-xs text-destructive">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="doctor-password">Password</Label>
                <Link
                  to={`/forgot-password?context=doctor&return=${encodeURIComponent("/doctor/login")}${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`}
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="doctor-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              {busy ? "Signing in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Need a doctor account?{" "}
              <Link to="/register/doctor" className="font-semibold text-primary hover:underline">
                Register here
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Are you a patient?{" "}
              <Link to="/patient/login" className="font-semibold text-primary hover:underline">
                Patient Login
              </Link>
            </p>

            <Link
              to="/"
              className="mx-auto inline-flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default DoctorLogin;

import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Stethoscope } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const buildDoctorSession = (
  email: string,
  payload: ReturnType<typeof extractAuthPayload>,
): LocalSession => {
  const user = payload.user ?? {};
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const roles = normalizeRoleList(user.roles ?? payload.roles);
  if (!roles.includes("doctor")) roles.push("doctor");

  const normalizedUser = {
    id: String(user.uuid ?? user.id ?? email),
    uuid: String(user.uuid ?? user.id ?? email),
    email: user.email ?? email,
    name: fullName || user.full_name || user.name || null,
    role: user.role ?? "doctor",
    user_type: user.user_type ?? "doctor",
    is_admin: user.is_admin === true,
    is_doctor: true,
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

const DoctorOnboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  const missingToken = !token;

  const signInAfterOnboard = async (nextEmail: string, nextPassword: string, onboardResponse: unknown) => {
    const onboardPayload = extractAuthPayload(onboardResponse);
    if (onboardPayload.token) return onboardPayload;

    const loginResponse = await api.auth.doctorLogin({ email: nextEmail, password: nextPassword });
    return extractAuthPayload(loginResponse);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!token) {
      toast({
        title: "Activation link missing token",
        description: "Please open the activation link from your approval email again.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast({
        title: "Valid email required",
        description: "Enter the email address from your approval email.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Please use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      toast({
        title: "Passwords do not match",
        description: "Confirm your EMR password exactly.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const onboardResponse = await api.auth.doctorOnboard({
        token,
        email: trimmedEmail,
        password,
        password_confirmation: passwordConfirmation,
      });

      try {
        const payload = await signInAfterOnboard(trimmedEmail, password, onboardResponse);
        if (payload.token) {
          const session = buildDoctorSession(trimmedEmail, payload);
          setStoredAuthToken(payload.token);
          setStoredSession(session);
          toast({
            title: "EMR access activated",
            description: "Your doctor portal password has been set.",
          });
          navigate("/doctor", { replace: true });
          return;
        }
      } catch {
        // Some APIs activate the password without returning or accepting an immediate login token.
      }

      setComplete(true);
      toast({
        title: "EMR access activated",
        description: "Your password has been set. Please sign in to continue.",
      });
    } catch (error) {
      const description =
        error instanceof ApiError && error.status === 422
          ? "Please check that the token has not expired and the passwords match."
          : error instanceof Error
            ? error.message
            : "Please try again.";

      toast({
        title: "Could not activate EMR access",
        description,
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
              {complete ? <CheckCircle2 className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Doctor EMR Portal
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold">Activate EMR Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set the password you will use for your clinical dashboard.
            </p>
          </div>

          {complete ? (
            <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                Your EMR password has been set. Continue to the doctor login page with your email and new password.
              </p>
              <Button asChild variant="hero" className="w-full">
                <Link to={`/doctor/login?email=${encodeURIComponent(email)}&redirect=/doctor`}>
                  <KeyRound className="h-4 w-4" />
                  Go to Doctor Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
              {missingToken && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  This activation link is missing its token. Open the full link from the approval email.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="doctor-onboard-email">Email Address</Label>
                <Input
                  id="doctor-onboard-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="doctor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-onboard-password">New EMR Password</Label>
                <Input
                  id="doctor-onboard-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-onboard-confirm">Confirm Password</Label>
                <Input
                  id="doctor-onboard-confirm"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={busy || missingToken}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {busy ? "Activating..." : "Activate EMR Portal Access"}
              </Button>

              <Link
                to="/doctor/login"
                className="mx-auto inline-flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to doctor login
              </Link>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default DoctorOnboard;

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, HeartPulse, Loader2, LockKeyhole } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { signInPatientWithPassword } from "@/lib/localStore";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const redirect = useMemo(() => {
    const requested = searchParams.get("redirect") || "/patient";
    return requested.startsWith("/patient") && requested !== "/patient/login" ? requested : "/patient";
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate(redirect, { replace: true });
    }
  }, [isAdmin, loading, navigate, redirect, user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await signInPatientWithPassword({ email, password });
      toast({ title: "Welcome back", description: "You can now access your patient portal." });
      navigate(redirect, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unable to sign in. Please try again.",
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
              <HeartPulse className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Patient Portal</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Patient Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in before opening your appointments, records and prescriptions.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="patient-email">Email or Username</Label>
              <Input
                id="patient-email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                placeholder="Patients@delsomed.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-password">Password</Label>
              <Input
                id="patient-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Login
            </Button>

            <Link
              to="/"
              className="mx-auto inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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

export default PatientLogin;

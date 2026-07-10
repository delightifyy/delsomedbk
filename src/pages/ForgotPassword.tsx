import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";

const contextTitle = (context: string) => {
  if (context === "patient") return "Patient Password Reset";
  if (context === "doctor") return "Doctor Password Reset";
  if (context === "mini-site") return "Mini-site Admin Password Reset";
  if (context === "admin") return "Admin Password Reset";
  return "Password Reset";
};

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const context = searchParams.get("context") ?? "account";
  const returnTo = searchParams.get("return") || "/";
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter the email address on your account.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      await api.auth.forgotPassword(trimmedEmail);
      setSent(true);
      toast({
        title: "Reset link sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to send reset link. Please try again.";
      toast({
        title: "Reset failed",
        description: message,
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
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account Access</p>
            <h1 className="mt-2 font-display text-4xl font-bold">{contextTitle(context)}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address and we will send you a secure reset link.
            </p>
          </div>

          {sent ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <h2 className="font-semibold">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for {email.trim()}, a password reset email has been sent.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to={returnTo}>Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                {busy ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link
                to={returnTo}
                className="mx-auto inline-flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default ForgotPassword;

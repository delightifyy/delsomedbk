import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const initialToken = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const returnTo = searchParams.get("return") || "/auth";

  const [token, setToken] = useState(initialToken);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedToken = token.trim();
    const trimmedEmail = email.trim();

    if (!trimmedToken || !trimmedEmail) {
      toast({
        title: "Reset link incomplete",
        description: "Please provide both the reset token and email address.",
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

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm the same password.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      await api.auth.resetPassword({
        token: trimmedToken,
        email: trimmedEmail,
        password,
        password_confirmation: confirmPassword,
      });
      setComplete(true);
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to reset password. Please try again.";
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
              <KeyRound className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account Access</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Set New Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>

          {complete ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <h2 className="font-semibold">Password changed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been updated successfully.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to={returnTo}>Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              {!initialToken && (
                <div className="space-y-2">
                  <Label htmlFor="reset-token">Reset Token</Label>
                  <Input
                    id="reset-token"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    required
                    placeholder="Paste token from email"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password-confirm">Confirm Password</Label>
                <Input
                  id="reset-password-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {busy ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;

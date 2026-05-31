import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { signInWithPassword } from "@/lib/localStore";
import { API_FALLBACK_TO_LOCAL, getStoredAuthToken } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const redirectTo = qs.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && (API_FALLBACK_TO_LOCAL || getStoredAuthToken())) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithPassword({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const description = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      toast({ title: "Auth error", description, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 max-w-md">
        <h1 className="font-display text-4xl font-bold text-center">Admin Sign In</h1>
        <p className="mt-2 text-center text-muted-foreground">Sign in to access your admin panel.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "Please wait..." : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground">← Back to site</Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
};

export default Auth;

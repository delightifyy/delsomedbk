import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { signInWithPassword, signUp } from "@/lib/localStore";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp({ email, password, fullName });
        toast({ title: "Account created", description: "You can now sign in." });
        setMode("signin");
      } else {
        await signInWithPassword({ email, password });
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 max-w-md">
        <h1 className="font-display text-4xl font-bold text-center">Welcome</h1>
        <p className="mt-2 text-center text-muted-foreground">Sign in to access your admin panel.</p>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mt-8">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value={mode} className="mt-6">
            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}
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
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                <Link to="/" className="hover:text-foreground">← Back to site</Link>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
};

export default Auth;

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError, setStoredAuthToken, clearApiAuthState } from "@/lib/api";
import { Shield, Loader2, AlertCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, refetchUser } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  // FIXED: Changed from "/admin/dashboard" to "/dashboard"
  const redirectTo = qs.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, isAdmin, loading, navigate, redirectTo]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    
    // Clear any existing auth state
    clearApiAuthState();
    localStorage.removeItem("carehub-local-session");
    
    try {
      console.log("Attempting admin login...");
      const response = await api.auth.adminLogin({ 
        email: email.trim(), 
        password 
      });
      
      console.log("Login response:", response);
      
      if (response.data?.token) {
        setStoredAuthToken(response.data.token);
        await new Promise(resolve => setTimeout(resolve, 100));
        await refetchUser();
        
        toast({ 
          title: "Success", 
          description: "Admin login successful!" 
        });
        
        navigate(redirectTo, { replace: true });
      } else {
        throw new Error("No token received");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed";
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (err.status === 403) {
          errorMessage = "You don't have admin privileges";
        } else if (err.status === 0 || err.message.includes("Cannot connect")) {
          errorMessage = "Cannot connect to API server. Please check your network/VPN connection.";
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({ 
        title: "Login Failed", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold">Admin Sign In</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your admin panel.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              placeholder="admin@delsomed.com"
              autoComplete="email"
            />
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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {busy ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link
              to={`/forgot-password?context=admin&return=${encodeURIComponent("/auth")}${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`}
              className="hover:text-primary"
            >
              Forgot password?
            </Link>
          </p>
          <p className="text-xs text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground">← Back to site</Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
};

export default Auth;

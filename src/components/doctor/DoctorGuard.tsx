import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { signInDoctorWithPassword, signInWithPassword } from "@/lib/localStore";

export const DoctorGuard = ({ children }: { children: ReactNode }) => {
  const { session, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const isDoctor = Boolean(session?.roles?.includes("doctor"));
  const hasAccess = isDoctor || isAdmin;

  useEffect(() => {
    if (!hasAccess) {
      setPassword("");
    }
  }, [hasAccess]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      try {
        await signInDoctorWithPassword({ email, password });
      } catch {
        await signInWithPassword({ email, password });
      }
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      toast({ title: "Doctor sign in failed", description, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_28%)]" />
        <div className="relative min-h-screen grid place-items-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl text-slate-900 backdrop-blur">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold">Admin</h1>
              <p className="mt-2 text-sm text-slate-500">Sign In using your credentials</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="doctor@example.com"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Your password"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DoctorGuard;

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Check, Heart, Users, Star, Calendar, ShieldCheck, Stethoscope, Sparkles, Loader2, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInPatientWithPassword } from "@/lib/localStore";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Heart;
  features: string[];
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "individual",
    name: "Individual Package",
    price: "₦50,000",
    period: "Yearly",
    description: "Personal healthcare designed for everyday wellness.",
    icon: Heart,
    features: [
      "8 Consultations per year",
      "Access to healthcare support",
      "Personal healthcare management",
      "Online appointment booking",
    ],
  },
  {
    id: "family",
    name: "Family Package",
    price: "₦100,000",
    period: "Yearly",
    description: "Comprehensive coverage for the whole family.",
    icon: Users,
    popular: true,
    features: [
      "20 Consultations per year",
      "Family healthcare management",
      "Multiple member access",
      "Online appointment booking",
      "Priority healthcare support",
    ],
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInPatientWithPassword({ email, password });
      toast({ title: "Welcome back", description: "Redirecting to your patient portal." });
      setLoginOpen(false);
      navigate("/patient");
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft/40 via-background to-background">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <div className="container py-20 sm:py-28 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            Healthcare Subscriptions
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
            Choose Your Healthcare <span className="text-primary">Subscription</span> Plan
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Affordable, reliable, and continuous access to verified healthcare professionals — for you and your loved ones, all year round.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="container py-16 sm:py-24">
        <div className="mb-12">
          {/* Section header removed as requested */}
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`group relative flex flex-col rounded-2xl border bg-card p-7 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/40 md:scale-[1.03] bg-gradient-to-b from-primary-soft/30 to-card"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                    <Star className="h-3 w-3 fill-current" /> Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${plan.popular ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-secondary/15 text-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      <Calendar className="h-3 w-3" /> {plan.period} Billing
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ year</span>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.popular ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  size="lg"
                  variant={plan.popular ? "hero" : "outline"}
                  className="mt-8 w-full"
                  onClick={() => setLoginOpen(true)}
                >
                  Subscribe
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Verified Doctors", text: "Every clinician on the network is credentialed and verified." },
            { icon: Calendar, title: "Easy Booking", text: "Book online anytime — at home, at work, or on the move." },
            { icon: Heart, title: "Continuous Care", text: "EMR-backed records ensure seamless follow-ups." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Login to Subscribe</DialogTitle>
            <DialogDescription>
              Sign in to your patient account to continue with your subscription.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sub-email">Email</Label>
              <Input
                id="sub-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-password">Password</Label>
              <Input
                id="sub-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Login
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register/patient"
                onClick={() => setLoginOpen(false)}
                className="font-semibold text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
};


export default Subscription;

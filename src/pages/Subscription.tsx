import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Check, Heart, Users, Star, Calendar, ShieldCheck, Stethoscope, Loader2, LockKeyhole, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInPatientWithPassword } from "@/lib/localStore";
import { publicApi, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Plan = {
  id: string;
  name: string;
  price: string;
  price_kobo: number;
  period: string;
  billing_period: "monthly" | "quarterly" | "yearly";
  description: string;
  features: string[];
  consultations_included: number;
  is_active: boolean;
  type: "individual" | "family" | "corporate" | "custom";
  popular?: boolean;
};

const formatPrice = (priceKobo: number): string => {
  const naira = priceKobo / 100;
  return `₦${naira.toLocaleString()}`;
};

const getBillingText = (period: string): string => {
  switch (period) {
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    case "yearly":
      return "Yearly";
    default:
      return period;
  }
};

const getIconByType = (type: string) => {
  switch (type) {
    case "family":
      return Users;
    case "corporate":
      return ShieldCheck;
    default:
      return Heart;
  }
};

// Skeleton Loading Component
const PlanSkeleton = () => {
  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-7 sm:p-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-3/4 mt-1" />
      <div className="mt-5">
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-full mt-8 rounded-lg" />
    </div>
  );
};

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await publicApi.subscriptionPackages({ 
          is_active: true 
        });
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid response from server");
        }
        
        if (response.data.length === 0) {
          setError("No subscription packages available at the moment.");
          setPlans([]);
          return;
        }
        
        // Transform API response to component format
        const transformedPlans: Plan[] = response.data.map((pkg: any, index: number) => {
          // Mark the family package or second package as popular
          const isPopular = pkg.type === "family" || (pkg.type === "individual" && index === 1);
          
          return {
            id: pkg.id,
            name: pkg.name,
            price: formatPrice(pkg.price_kobo),
            price_kobo: pkg.price_kobo,
            period: getBillingText(pkg.billing_period),
            billing_period: pkg.billing_period,
            description: pkg.description,
            features: pkg.features || [
              `${pkg.consultations_included} Consultations per year`,
              "Access to healthcare support",
              "Online appointment booking",
            ],
            consultations_included: pkg.consultations_included,
            is_active: pkg.is_active,
            type: pkg.type,
            popular: isPopular,
          };
        });
        
        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching subscription packages:", error);
        if (error instanceof ApiError) {
          setError(error.message);
          toast({
            title: "Unable to load plans",
            description: error.message,
            variant: "destructive",
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : "Failed to load subscription packages";
          setError(errorMessage);
          toast({
            title: "Unable to load plans",
            description: errorMessage,
            variant: "destructive",
          });
        }
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [toast]);

  const handleSubscribe = (plan: Plan) => {
    // Store selected plan in session storage for checkout
    sessionStorage.setItem("selected_subscription_plan", JSON.stringify({
      id: plan.id,
      name: plan.name,
      price_kobo: plan.price_kobo,
      billing_period: plan.billing_period,
      consultations_included: plan.consultations_included,
      type: plan.type,
    }));
    setLoginOpen(true);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInPatientWithPassword({ email, password });
      toast({ title: "Welcome back", description: "Redirecting to checkout..." });
      setLoginOpen(false);
      // Navigate to checkout with subscription
      navigate("/patient/subscription/checkout");
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

  // Skeleton Loading State
  if (loading) {
    return (
      <SiteLayout>
        {/* Hero Skeleton */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft/40 via-background to-background">
          <div className="container py-20 sm:py-28 text-center max-w-3xl">
            <Skeleton className="h-8 w-48 mx-auto rounded-full" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mt-6" />
            <Skeleton className="h-12 w-full max-w-xl mx-auto mt-5" />
          </div>
        </section>

        {/* Plans Skeleton */}
        <section className="container py-16 sm:py-24">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            <PlanSkeleton />
            <PlanSkeleton />
          </div>

          {/* Trust strip Skeleton */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </SiteLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Unable to Load Plans</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // Empty State
  if (plans.length === 0) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">No Plans Available</h2>
            <p className="text-muted-foreground mb-6">
              There are no subscription plans available at the moment. Please check back later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

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
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => {
            const Icon = getIconByType(plan.type);
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
                  <span className="text-sm text-muted-foreground">/ {plan.period.toLowerCase()}</span>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.popular ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  size="lg"
                  variant={plan.popular ? "hero" : "outline"}
                  className="mt-8 w-full"
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe Now
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
              Login & Continue
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
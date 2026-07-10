import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, MailCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

const FAILURE_WORDS = ["error", "failed", "failure", "invalid", "expired"];

const PatientEmailVerification = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusText = [
    searchParams.get("status"),
    searchParams.get("verified"),
    searchParams.get("success"),
    searchParams.get("error"),
    searchParams.get("message"),
    location.pathname,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isProblem = FAILURE_WORDS.some((word) => statusText.includes(word));

  return (
    <SiteLayout>
      <section className="container flex min-h-[70vh] items-center justify-center py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-xl ${isProblem ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {isProblem ? <AlertTriangle className="h-7 w-7" /> : <MailCheck className="h-7 w-7" />}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Patient Portal</p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {isProblem ? "Verification link needs attention" : "Email confirmed successfully"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isProblem
              ? "We could not confirm this email link. It may be expired or already used. Please try logging in, or register again if the account was not created."
              : "Your patient account has been verified. You can now log in to continue to your patient portal or complete your appointment booking."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/patient/login">
                <CheckCircle2 className="h-4 w-4" />
                Login to Patient Portal
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register/patient">Create another account</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PatientEmailVerification;

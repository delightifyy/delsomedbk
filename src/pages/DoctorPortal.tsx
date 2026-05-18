import { Link } from "react-router-dom";
import { Stethoscope, Users, ArrowRight, ShieldCheck, Activity, CalendarCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const features = [
  { icon: CalendarCheck, title: "Appointments & Scheduling", desc: "Book, reschedule and manage consultations in one place." },
  { icon: Activity, title: "Electronic Medical Records", desc: "Secure EMR access for doctors and patients across visits." },
  { icon: ShieldCheck, title: "Verified & Secure", desc: "NDPR-aligned data handling with role-based access controls." },
];

const DoctorPortal = () => {
  return (
    <SiteLayout>
      <section className="container py-14 sm:py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Stethoscope className="h-3.5 w-3.5" /> Doctor & Patient Portal
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-black leading-tight">
            Welcome to the <span className="text-primary">DesolMed</span> Portal
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            A dedicated multi-tenant clinical platform for verified doctors, patients and partner organizations. Sign in to manage consultations, EMR, referrals and more.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary/90 transition-colors"
            >
              <Stethoscope className="h-4 w-4" /> Sign in as Doctor
            </Link>
            <Link
              to="/register/patient"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Users className="h-4 w-4" /> Patient Access
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl font-bold">New to DesolMed?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Register as a doctor, organization or pharmacy to access the portal.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            Create an account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default DoctorPortal;

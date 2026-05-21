import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, HeartPulse, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();

  const [busy, setBusy] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [howHeard, setHowHeard] = useState("");

  const [nextOfKinEnabled, setNextOfKinEnabled] = useState(false);
  const [nokFullName, setNokFullName] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const redirect = useMemo(() => {
    const requested = searchParams.get("redirect") || "/patient";
    return requested.startsWith("/patient") && requested !== "/patient/login" ? requested : "/patient";
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate(redirect, { replace: true });
    }
  }, [isAdmin, loading, navigate, redirect, user]);

  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPasswordValid = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
  const isPastDate = (value: string) => {
    if (!value) return true;
    const d = new Date(value);
    return d.toString() !== "Invalid Date" && d < new Date();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Validation", description: "First and last name are required.", variant: "destructive" });
      return;
    }
    if (!isEmailValid(email)) {
      toast({ title: "Validation", description: "Please enter a valid email.", variant: "destructive" });
      return;
    }
    if (!isPasswordValid(password)) {
      toast({
        title: "Validation",
        description: "Password must be at least 8 characters and contain letters and numbers.",
        variant: "destructive",
      });
      return;
    }
    if (password !== passwordConfirmation) {
      toast({ title: "Validation", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!isPastDate(dateOfBirth)) {
      toast({ title: "Validation", description: "Date of birth must be in the past.", variant: "destructive" });
      return;
    }
    if (nextOfKinEnabled && (!nokFullName.trim() || !nokPhone.trim() || !nokRelationship.trim())) {
      toast({ title: "Validation", description: "Please complete next of kin details.", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      };

      if (phone.trim()) payload.phone = phone.trim();
      if (city.trim()) payload.city = city.trim();
      if (gender) payload.gender = gender;
      if (dateOfBirth) payload.date_of_birth = dateOfBirth;
      if (howHeard) payload.how_heard_about_us = howHeard;
      if (nextOfKinEnabled) {
        payload.next_of_kin = {
          full_name: nokFullName.trim(),
          phone: nokPhone.trim(),
          relationship: nokRelationship.trim(),
        };
      }

      const res = await api.auth.registerPatient(payload);

      toast({ title: "Registration submitted", description: "A verification email was sent." });

      setDialogOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to register. Please try again.";
      toast({ title: "Registration failed", description: message, variant: "destructive" });
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
              <HeartPulse className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Patient Portal</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Patient Registration</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create a patient account — verification required.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} placeholder="Enter your first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} placeholder="Enter your last name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="Create a password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm">Confirm password</Label>
              <div className="relative">
                <Input
                  id="password-confirm"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswordConfirmation((value) => !value)}
                  aria-label={showPasswordConfirmation ? "Hide confirm password" : "Show confirm password"}
                >
                  {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} placeholder="Enter your phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} placeholder="Enter your city" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(v) => setGender(v)}>
                  <SelectTrigger id="gender">
                    <SelectValue>{GENDERS.find((g) => g.value === gender)?.label ?? "Prefer not to say"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value || "none"} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="how">How did you hear about us?</Label>
              <Textarea id="how" value={howHeard} onChange={(e) => setHowHeard(e.target.value)} maxLength={255} placeholder="Tell us how you heard about us" />
            </div>

            <div className="space-y-2 border-t pt-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="rounded" checked={nextOfKinEnabled} onChange={(e) => setNextOfKinEnabled(e.target.checked)} />
                <span className="text-sm">Add next of kin details</span>
              </label>

              {nextOfKinEnabled && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nok-full">Full name</Label>
                    <Input id="nok-full" value={nokFullName} onChange={(e) => setNokFullName(e.target.value)} placeholder="Enter next of kin full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nok-phone">Phone</Label>
                    <Input id="nok-phone" value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} placeholder="Enter next of kin phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nok-relationship">Relationship</Label>
                    <Input id="nok-relationship" value={nokRelationship} onChange={(e) => setNokRelationship(e.target.value)} placeholder="Enter relationship" />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/patient/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>

            <Link
              to="/"
              className="mx-auto inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
          </form>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registration submitted</DialogTitle>
                <DialogDescription>
                  Your account has been created. Please check your email and verify your account before logging in.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    navigate("/patient/login", { replace: true });
                  }}
                >
                  Okay
                </Button>
              </div>

              <DialogClose />
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </SiteLayout>
  );
};

export default RegisterPatient;

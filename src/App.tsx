import { lazy, Suspense, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminGuard } from "@/components/dashboard/AdminGuard";
import { PatientGuard } from "@/components/portal/PatientGuard";
import { DoctorGuard } from "@/components/doctor/DoctorGuard";
import { api } from "@/lib/api";
import desolmedLogo from "@/assets/desolmed-logo.png";

const queryClient = new QueryClient();
const routeFallback = <div className="min-h-screen bg-background" />;

const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Doctors = lazy(() => import("./pages/Doctors.tsx"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile.tsx"));
const Adverts = lazy(() => import("./pages/Adverts.tsx"));
const HealthNews = lazy(() => import("./pages/HealthNews.tsx"));
const HealthNewsArticle = lazy(() => import("./pages/HealthNewsArticle.tsx"));
const AdvertArticle = lazy(() => import("./pages/AdvertArticle.tsx"));
const DoctorPortal = lazy(() => import("./pages/MediCare.tsx"));
const MediCareAdmin = lazy(() => import("./pages/MediCareAdmin.tsx"));
const BookingAdmin = lazy(() => import("./pages/BookingAdmin.tsx"));
const MediCareServices = lazy(() => import("./pages/MediCareServices.tsx"));
const MediCareBlogs = lazy(() => import("./pages/MediCareBlogs.tsx"));
const MediCareBlogArticle = lazy(() => import("./pages/MediCareBlogArticle.tsx"));
const MediCareContact = lazy(() => import("./pages/MediCareContact.tsx"));
const MediCareServicesAdmin = lazy(() => import("./pages/MediCareServicesAdmin.tsx"));
const DoctorMediCare = lazy(() => import("./pages/DoctorMediCare.tsx"));
const RegisterPatient = lazy(() => import("./pages/RegisterPatient.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const PatientLogin = lazy(() => import("./pages/PatientLogin.tsx"));
const DashOverview = lazy(() => import("./pages/dashboard/Overview.tsx"));
const DashUsers = lazy(() => import("./pages/dashboard/Users.tsx"));
const DashPatients = lazy(() => import("./pages/dashboard/Patients.tsx"));
const DashDoctors = lazy(() => import("./pages/dashboard/Doctors.tsx"));
const DashContacts = lazy(() => import("./pages/dashboard/Contacts.tsx"));
const DashBlog = lazy(() => import("./pages/dashboard/Blog.tsx"));
const DashNotifications = lazy(() => import("./pages/dashboard/Notifications.tsx"));
const DashNews = lazy(() => import("./pages/dashboard/News.tsx"));
const DashNewsletter = lazy(() => import("./pages/dashboard/Newsletter.tsx"));
const DashActivityLogs = lazy(() => import("./pages/dashboard/ActivityLogs.tsx"));
const DashLookups = lazy(() => import("./pages/dashboard/Lookups.tsx"));
const DashFaqs = lazy(() => import("./pages/dashboard/Faqs.tsx"));
const DashTestimonials = lazy(() => import("./pages/dashboard/Testimonials.tsx"));
const DashSubscribers = lazy(() => import("./pages/dashboard/Subscribers.tsx"));
const DashSubscriberCreate = lazy(() => import("./pages/dashboard/CreateSubscriptionPage.tsx"));
const DashAppointments = lazy(() => import("./pages/dashboard/Appointments.tsx"));
const HmoProviders = lazy(() => import("./pages/dashboard/HMOProviders.tsx"));
const CoverageRequests = lazy(() => import("./pages/dashboard/CoverageRequests.tsx")); // NEW IMPORT
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard.tsx"));
const PatientAppointments = lazy(() => import("./pages/patient/Appointments.tsx"));
const PatientConsultations = lazy(() => import("./pages/patient/ConsultationHistory.tsx"));
const PatientRecords = lazy(() => import("./pages/patient/MedicalRecords.tsx"));
const PatientPrescriptions = lazy(() => import("./pages/patient/Prescriptions.tsx"));
const PatientPayments = lazy(() => import("./pages/patient/Payments.tsx"));
const PatientSettings = lazy(() => import("./pages/patient/Settings.tsx"));
const DoctorPortalDashboard = lazy(() => import("./pages/doctor/Dashboard.tsx"));
const DoctorSchedule = lazy(() => import("./pages/doctor/Schedule.tsx"));
const DoctorConsultations = lazy(() => import("./pages/doctor/Consultations.tsx"));
const DoctorConsultationRoom = lazy(() => import("./pages/doctor/ConsultationRoom.tsx"));
const DoctorPatients = lazy(() => import("./pages/doctor/Patients.tsx"));
const DoctorPrescriptions = lazy(() => import("./pages/doctor/Misc.tsx").then((module) => ({ default: module.DoctorPrescriptions })));
const DoctorInvestigations = lazy(() => import("./pages/doctor/Misc.tsx").then((module) => ({ default: module.DoctorInvestigations })));
const DoctorReferrals = lazy(() => import("./pages/doctor/Misc.tsx").then((module) => ({ default: module.DoctorReferrals })));
const DoctorSettings = lazy(() => import("./pages/doctor/Misc.tsx").then((module) => ({ default: module.DoctorSettings })));
const DoctorClinical = lazy(() => import("./pages/doctor/Clinical.tsx"));
const OrgDashboard = lazy(() => import("./pages/organization/Dashboard.tsx"));
const OrgStaff = lazy(() => import("./pages/organization/Staff.tsx"));
const OrgUsage = lazy(() => import("./pages/organization/Usage.tsx"));
const OrgBilling = lazy(() => import("./pages/organization/Misc.tsx").then((module) => ({ default: module.Billing })));
const OrgInvoices = lazy(() => import("./pages/organization/Misc.tsx").then((module) => ({ default: module.Invoices })));
const OrgSettings = lazy(() => import("./pages/organization/Misc.tsx").then((module) => ({ default: module.OrgSettings })));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.tsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.tsx"));
const Subscription = lazy(() => import("./pages/Subscription.tsx"));

// Nice loading component with Desolmed logo
const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
        <div className="relative animate-bounce">
          <img 
            src={desolmedLogo} 
            alt="Desolmed" 
            className="w-24 h-24 mx-auto object-contain"
          />
        </div>
      </div>
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-teal-500 border-b-blue-600 border-l-teal-500 animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium text-lg animate-pulse">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your experience</p>
    </div>
  </div>
);

// Component for doctor not found (404)
const DoctorNotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center px-4">
      <img 
        src={desolmedLogo} 
        alt="Desolmed" 
        className="w-20 h-20 mx-auto mb-6 opacity-50"
      />
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Doctor Not Found</h2>
      <p className="text-gray-600 mb-8">
        The doctor's website you're looking for doesn't exist or has been removed.
      </p>
      <a 
        href="https://delsomeds.itl.ng" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
      >
        Return to Home
      </a>
    </div>
  </div>
);

// Main App component with subdomain detection
const App = () => {
  const [miniSiteState, setMiniSiteState] = useState<{
    loading: boolean;
    doctorData: any | null;
    slug: string | null;
    error: string | null;
  }>({
    loading: true,
    doctorData: null,
    slug: null,
    error: null,
  });

  useEffect(() => {
    const host = window.location.hostname;
    const baseDomain = import.meta.env.VITE_MINI_SITE_BASE_DOMAIN || 'delsomeds.itl.ng';
    
    let slug: string | null = null;
    
    if (host === baseDomain || host === `www.${baseDomain}`) {
      slug = null;
    } else if (host.endsWith(`.${baseDomain}`)) {
      slug = host.slice(0, -baseDomain.length - 1);
      if (!slug || !/^[a-z0-9-]{1,30}$/.test(slug)) {
        slug = null;
      }
    } else {
      slug = null;
    }

    if (!slug) {
      setMiniSiteState({
        loading: false,
        doctorData: null,
        slug: null,
        error: null,
      });
      return;
    }

    const fetchDoctorData = async () => {
      try {
        const response = await api.medicare.public.bundle(slug);
        setMiniSiteState({
          loading: false,
          doctorData: response.data,
          slug: slug,
          error: null,
        });
      } catch (error: any) {
        console.error('Failed to fetch doctor data for slug:', slug, error);
        setMiniSiteState({
          loading: false,
          doctorData: null,
          slug: slug,
          error: error.status === 404 ? 'NOT_FOUND' : 'ERROR',
        });
      }
    };

    fetchDoctorData();
  }, []);

  if (miniSiteState.loading) {
    return <LoadingScreen />;
  }

  if (miniSiteState.slug && !miniSiteState.doctorData && miniSiteState.error === 'NOT_FOUND') {
    return <DoctorNotFound />;
  }

  if (miniSiteState.slug && miniSiteState.doctorData) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={routeFallback}>
                <DoctorPortalWrapper doctorData={miniSiteState.doctorData} slug={miniSiteState.slug} />
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={routeFallback}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:id" element={<DoctorProfile />} />
                <Route path="/medicare/:doctorId" element={<DoctorMediCare />} />
                <Route path="/adverts" element={<Adverts />} />
                <Route path="/health-news" element={<HealthNews />} />
                <Route path="/health-news/:slug" element={<HealthNewsArticle />} />
                <Route path="/adverts/:id" element={<AdvertArticle />} />
                <Route path="/doctor-portal" element={<DoctorPortal />} />
                <Route path="/doctor-portal/admin" element={<DoctorGuard><MediCareAdmin /></DoctorGuard>} />
                <Route path="/doctor-portal/admin/booking" element={<DoctorGuard><BookingAdmin /></DoctorGuard>} />
                <Route path="/doctor-portal/services" element={<MediCareServices />} />
                <Route path="/doctor-portal/blogs" element={<MediCareBlogs />} />
                <Route path="/doctor-portal/blogs/:slug" element={<MediCareBlogArticle />} />
                <Route path="/doctor-portal/contact" element={<MediCareContact />} />
                <Route path="/doctor-portal/admin/services" element={<DoctorGuard><MediCareServicesAdmin /></DoctorGuard>} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/doctor" element={<Navigate to="/register?type=doctor" replace />} />
                <Route path="/register/organization" element={<Navigate to="/register?type=organization" replace />} />
                <Route path="/register/pharmacy" element={<Navigate to="/register?type=pharmacy" replace />} />
                <Route path="/register/diagnostics" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
                <Route path="/register/laboratory" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
                <Route path="/register/lab-diagnostics" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
                <Route path="/register/patient" element={<RegisterPatient />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/dashboard" element={<AdminGuard><DashOverview /></AdminGuard>} />
                <Route path="/dashboard/users" element={<AdminGuard><DashUsers /></AdminGuard>} />
                <Route path="/dashboard/patients" element={<AdminGuard><DashPatients /></AdminGuard>} />
                <Route path="/dashboard/doctors" element={<AdminGuard><DashDoctors /></AdminGuard>} />
                <Route path="/dashboard/contacts" element={<AdminGuard><DashContacts /></AdminGuard>} />
                <Route path="/dashboard/blog" element={<AdminGuard><DashBlog /></AdminGuard>} />
                <Route path="/dashboard/news" element={<AdminGuard><DashNews /></AdminGuard>} />
                <Route path="/dashboard/newsletter" element={<AdminGuard><DashNewsletter /></AdminGuard>} />
                <Route path="/dashboard/lookups" element={<AdminGuard><DashLookups /></AdminGuard>} />
                <Route path="/dashboard/activity-logs" element={<AdminGuard><DashActivityLogs /></AdminGuard>} />
                <Route path="/dashboard/faqs" element={<AdminGuard><DashFaqs /></AdminGuard>} />
                <Route path="/dashboard/testimonials" element={<AdminGuard><DashTestimonials /></AdminGuard>} />
                <Route path="/dashboard/subscribers" element={<AdminGuard><DashSubscribers /></AdminGuard>} />
                <Route path="/dashboard/create-subscriber-page" element={<AdminGuard><DashSubscriberCreate /></AdminGuard>} />
                <Route path="/dashboard/appointments" element={<AdminGuard><DashAppointments /></AdminGuard>} />
                <Route path="/dashboard/hmo-providers" element={<AdminGuard><HmoProviders /></AdminGuard>} />
                <Route path="/dashboard/coverage-requests" element={<AdminGuard><CoverageRequests /></AdminGuard>} /> {/* NEW ROUTE */}
                <Route path="/dashboard/notifications" element={<AdminGuard><DashNotifications /></AdminGuard>} />
                <Route path="/patient" element={<PatientGuard><PatientDashboard /></PatientGuard>} />
                <Route path="/patient/appointments" element={<PatientGuard><PatientAppointments /></PatientGuard>} />
                <Route path="/patient/consultations" element={<PatientGuard><PatientConsultations /></PatientGuard>} />
                <Route path="/patient/records" element={<PatientGuard><PatientRecords /></PatientGuard>} />
                <Route path="/patient/prescriptions" element={<PatientGuard><PatientPrescriptions /></PatientGuard>} />
                <Route path="/patient/payments" element={<PatientGuard><PatientPayments /></PatientGuard>} />
                <Route path="/patient/settings" element={<PatientGuard><PatientSettings /></PatientGuard>} />
                <Route path="/doctor" element={<DoctorPortalDashboard />} />
                <Route path="/doctor/schedule" element={<DoctorSchedule />} />
                <Route path="/doctor/consultations" element={<DoctorConsultations />} />
                <Route path="/doctor/clinical" element={<DoctorClinical />} />
                <Route path="/doctor/consultations/:id" element={<DoctorConsultationRoom />} />
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/doctor/investigations" element={<DoctorInvestigations />} />
                <Route path="/doctor/referrals" element={<DoctorReferrals />} />
                <Route path="/doctor/settings" element={<DoctorSettings />} />
                <Route path="/organization" element={<OrgDashboard />} />
                <Route path="/organization/staff" element={<OrgStaff />} />
                <Route path="/organization/usage" element={<OrgUsage />} />
                <Route path="/organization/billing" element={<OrgBilling />} />
                <Route path="/organization/invoices" element={<OrgInvoices />} />
                <Route path="/organization/settings" element={<OrgSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Wrapper that routes to the REAL DoctorPortal with the doctor's data
const DoctorPortalWrapper = ({ doctorData, slug }: { doctorData: any; slug: string }) => {
  return (
    <Routes>
      <Route path="/" element={<DoctorPortal doctorSlug={slug} />} />
      <Route path="/services" element={<MediCareServices doctorSlug={slug} />} />
      <Route path="/blogs" element={<MediCareBlogs doctorSlug={slug} />} />
      <Route path="/blogs/:postSlug" element={<MediCareBlogArticle doctorSlug={slug} />} />
      <Route path="/contact" element={<MediCareContact doctorSlug={slug} />} />
      <Route path="*" element={<DoctorPortal doctorSlug={slug} />} />
    </Routes>
  );
};

export default App;
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminGuard } from "@/components/dashboard/AdminGuard";
import { PatientGuard } from "@/components/portal/PatientGuard";
import { DoctorGuard } from "@/components/doctor/DoctorGuard";

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

const App = () => (
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
              <Route path="/dashboard/hmo-providers" element={<AdminGuard><HmoProviders /></AdminGuard>} /> {/* FIXED: added hyphen */}
              <Route path="/dashboard/notifications" element={<AdminGuard><DashNotifications /></AdminGuard>} />

              {/* Patient Portal */}
              <Route path="/patient" element={<PatientGuard><PatientDashboard /></PatientGuard>} />
              <Route path="/patient/appointments" element={<PatientGuard><PatientAppointments /></PatientGuard>} />
              <Route path="/patient/consultations" element={<PatientGuard><PatientConsultations /></PatientGuard>} />
              <Route path="/patient/records" element={<PatientGuard><PatientRecords /></PatientGuard>} />
              <Route path="/patient/prescriptions" element={<PatientGuard><PatientPrescriptions /></PatientGuard>} />
              <Route path="/patient/payments" element={<PatientGuard><PatientPayments /></PatientGuard>} />
              <Route path="/patient/settings" element={<PatientGuard><PatientSettings /></PatientGuard>} />

              {/* Doctor EMR Portal */}
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

              {/* Organization / HMO Portal */}
              <Route path="/organization" element={<OrgDashboard />} />
              <Route path="/organization/staff" element={<OrgStaff />} />
              <Route path="/organization/usage" element={<OrgUsage />} />
              <Route path="/organization/billing" element={<OrgBilling />} />
              <Route path="/organization/invoices" element={<OrgInvoices />} />
              <Route path="/organization/settings" element={<OrgSettings />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
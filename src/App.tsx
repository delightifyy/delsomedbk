import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminGuard } from "@/components/dashboard/AdminGuard";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Doctors from "./pages/Doctors.tsx";
import DoctorProfile from "./pages/DoctorProfile.tsx";
import Adverts from "./pages/Adverts.tsx";
import HealthNews from "./pages/HealthNews.tsx";
import HealthNewsArticle from "./pages/HealthNewsArticle.tsx";
import AdvertArticle from "./pages/AdvertArticle.tsx";
import DoctorPortal from "./pages/MediCare.tsx";
import MediCareAdmin from "./pages/MediCareAdmin.tsx";
import BookingAdmin from "./pages/BookingAdmin.tsx";
import DoctorMediCare from "./pages/DoctorMediCare.tsx";
import RegisterPatient from "./pages/RegisterPatient.tsx";
import Register from "./pages/Register.tsx";
import { Navigate } from "react-router-dom";
import Auth from "./pages/Auth.tsx";
import DashOverview from "./pages/dashboard/Overview.tsx";
import DashUsers from "./pages/dashboard/Users.tsx";
import DashDoctors from "./pages/dashboard/Doctors.tsx";
import DashContacts from "./pages/dashboard/Contacts.tsx";
import DashBlog from "./pages/dashboard/Blog.tsx";
import DashNotifications from "./pages/dashboard/Notifications.tsx";
import DashNews from "./pages/dashboard/News.tsx";
import DashNewsletter from "./pages/dashboard/Newsletter.tsx";
import DashActivityLogs from "./pages/dashboard/ActivityLogs.tsx";
import DashLookups from "./pages/dashboard/Lookups.tsx";

import DashFaqs from "./pages/dashboard/Faqs.tsx";
import PatientDashboard from "./pages/patient/Dashboard.tsx";
import PatientAppointments from "./pages/patient/Appointments.tsx";
import PatientRecords from "./pages/patient/MedicalRecords.tsx";
import PatientPrescriptions from "./pages/patient/Prescriptions.tsx";
import PatientPayments from "./pages/patient/Payments.tsx";
import PatientSettings from "./pages/patient/Settings.tsx";
import DoctorPortalDashboard from "./pages/doctor/Dashboard.tsx";
import DoctorSchedule from "./pages/doctor/Schedule.tsx";
import DoctorConsultations from "./pages/doctor/Consultations.tsx";
import DoctorConsultationRoom from "./pages/doctor/ConsultationRoom.tsx";
import DoctorPatients from "./pages/doctor/Patients.tsx";
import { DoctorPrescriptions, DoctorInvestigations, DoctorReferrals, DoctorSettings } from "./pages/doctor/Misc.tsx";
import OrgDashboard from "./pages/organization/Dashboard.tsx";
import OrgStaff from "./pages/organization/Staff.tsx";
import OrgUsage from "./pages/organization/Usage.tsx";
import { Billing as OrgBilling, Invoices as OrgInvoices, OrgSettings } from "./pages/organization/Misc.tsx";
import DashTestimonials from "./pages/dashboard/Testimonials.tsx";
import NotFound from "./pages/NotFound.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsAndConditions from "./pages/TermsAndConditions.tsx";
import CookiePolicy from "./pages/CookiePolicy.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/medicare/:doctorId" element={<DoctorMediCare />} />
            <Route path="/adverts" element={<Adverts />} />
            <Route path="/health-news" element={<HealthNews />} />
            <Route path="/health-news/:slug" element={<HealthNewsArticle />} />
            <Route path="/adverts/:id" element={<AdvertArticle />} />
            <Route path="/doctor-portal" element={<DoctorPortal />} />
            <Route path="/doctor-portal/admin" element={<MediCareAdmin />} />
            <Route path="/doctor-portal/admin/booking" element={<BookingAdmin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/doctor" element={<Navigate to="/register?type=doctor" replace />} />
            <Route path="/register/organization" element={<Navigate to="/register?type=organization" replace />} />
            <Route path="/register/pharmacy" element={<Navigate to="/register?type=pharmacy" replace />} />
            <Route path="/register/diagnostics" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
            <Route path="/register/laboratory" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
            <Route path="/register/lab-diagnostics" element={<Navigate to="/register?type=lab-diagnostics" replace />} />
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<AdminGuard><DashOverview /></AdminGuard>} />
            <Route path="/dashboard/users" element={<AdminGuard><DashUsers /></AdminGuard>} />
            <Route path="/dashboard/doctors" element={<AdminGuard><DashDoctors /></AdminGuard>} />
            <Route path="/dashboard/contacts" element={<AdminGuard><DashContacts /></AdminGuard>} />
            <Route path="/dashboard/blog" element={<AdminGuard><DashBlog /></AdminGuard>} />
            <Route path="/dashboard/news" element={<AdminGuard><DashNews /></AdminGuard>} />
            <Route path="/dashboard/newsletter" element={<AdminGuard><DashNewsletter /></AdminGuard>} />
            <Route path="/dashboard/lookups" element={<AdminGuard><DashLookups /></AdminGuard>} />
            <Route path="/dashboard/activity-logs" element={<AdminGuard><DashActivityLogs /></AdminGuard>} />
            
            <Route path="/dashboard/faqs" element={<AdminGuard><DashFaqs /></AdminGuard>} />
            <Route path="/dashboard/testimonials" element={<AdminGuard><DashTestimonials /></AdminGuard>} />
            <Route path="/dashboard/notifications" element={<AdminGuard><DashNotifications /></AdminGuard>} />

            {/* Patient Portal */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/records" element={<PatientRecords />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/payments" element={<PatientPayments />} />
            <Route path="/patient/settings" element={<PatientSettings />} />

            {/* Doctor EMR Portal */}
            <Route path="/doctor" element={<DoctorPortalDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/consultations" element={<DoctorConsultations />} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

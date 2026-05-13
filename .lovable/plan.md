# Plan: Healthcare Portals (Patient, Doctor EMR, Organization/HMO)

Extend the existing Delsomed project with three authenticated portals and a new footer "Portals" section. Reuse existing branding (sage primary, Poppins/Inter), shadcn/ui components, and current auth (`useAuth`).

## 1. Footer update
- Edit `src/components/site/SiteFooter.tsx`: add a new "Portals" row above the existing grid (or as a top band) with three premium cards linking to `/patient`, `/doctor`, `/organization`. Hover lift, sage→secondary gradient, icon + label + short description, fully responsive.

## 2. Shared portal infrastructure
- `src/components/portal/PortalLayout.tsx` — shadcn Sidebar shell (collapsible icon mode) with header containing `SidebarTrigger`, breadcrumb, user menu. Accepts `nav` items and `title`. Wraps in `SidebarProvider`.
- `src/components/portal/PortalSidebar.tsx` — generic sidebar driven by nav config (icon, label, path), active highlight via `NavLink`.
- `src/components/portal/StatCard.tsx`, `EmptyState.tsx`, `PageHeader.tsx`, `SectionCard.tsx` — reusable building blocks.
- All routes guarded by a lightweight `PortalGuard` (uses `useAuth`; redirects unauthenticated users to `/auth`). Role gating is UI-only for now (no DB schema changes) — we use existing session.

## 3. Patient Portal (`/patient/*`)
Pages under `src/pages/patient/`:
- `Dashboard.tsx` — welcome, quick stats (upcoming, past, prescriptions, balance), upcoming appointments timeline, quick actions (Join, Book, View Records).
- `Appointments.tsx` — list + appointment detail drawer (doctor info, date/time, status, Join button, notes preview, Reschedule placeholder).
- `MedicalRecords.tsx` — timeline UI, expandable cards (diagnoses/treatments/attachments), search/filter.
- `Prescriptions.tsx` — list, medication details, status badges, Download button.
- `Payments.tsx` — transactions table, subscription card, HMO usage, billing cards.
- `Settings.tsx` — tabs: Profile, Password, Notifications, Security.
- Mock data file: `src/data/patientMock.ts`.

## 4. Doctor EMR Portal (`/doctor/*`)
Pages under `src/pages/doctor/`:
- `Dashboard.tsx` — today's schedule, upcoming consultations, notifications, stat cards, Start Consultation buttons.
- `Schedule.tsx` — calendar/agenda list view.
- `Consultations.tsx` — list of consultations → links to `/doctor/consultations/:id`.
- `ConsultationRoom.tsx` — **3-column EMR layout**:
  - Left: patient details, history, previous consults, allergies, meds.
  - Center: large video placeholder (camera off icon), mic/cam/share/end controls.
  - Right: Tabs — Clinical Notes (symptoms, diagnosis, observations, plan, save + autosave indicator), Prescription (dynamic medication list, generate, send), Investigations (lab select, test type, notes, add/send/download), Referral (specialist select, notes, send/download).
  - Responsive: stacks vertically on mobile/tablet.
- `Patients.tsx` — searchable/filterable table + profile drawer with history preview.
- `Prescriptions.tsx`, `Investigations.tsx`, `Referrals.tsx` — list views.
- `Settings.tsx`.
- Mock data: `src/data/doctorMock.ts`.

## 5. Organization / HMO Portal (`/organization/*`)
Pages under `src/pages/organization/`:
- `Dashboard.tsx` — usage overview, staff metrics, billing summary, active subs, recent activities (charts via `recharts`).
- `Staff.tsx` — staff table, add/remove modal, status badges, search/filter.
- `Usage.tsx` — consultation usage, department usage, monthly analytics, utilization line/bar charts.
- `Billing.tsx`, `Invoices.tsx` — invoice cards, payment history, download buttons, subscription overview.
- `Settings.tsx`.
- Mock data: `src/data/orgMock.ts`.

## 6. Routing
Update `src/App.tsx`: add nested routes for `/patient/*`, `/doctor/*`, `/organization/*`, each wrapped in `PortalGuard` + `PortalLayout`. Keep all existing routes untouched. Note: existing `/doctor-portal` (MediCare public page) stays — new portal lives at `/doctor` to avoid collision.

## Technical Notes
- No DB/schema changes; all data is realistic mock from `src/data/*Mock.ts`.
- Reuse shadcn `sidebar`, `tabs`, `table`, `card`, `dialog`, `drawer`, `badge`, `avatar`, `skeleton`, `dropdown-menu`.
- Charts: `recharts` (already a shadcn dep via `chart.tsx`).
- All colors via semantic tokens (`bg-primary`, `text-secondary`, `bg-muted`, etc.). No hardcoded hex.
- Mobile-first; sidebar collapses to icon mode on desktop, offcanvas sheet on mobile.
- Loading/empty/error states + skeletons on every list/dashboard.
- Footer Portals section: 3 cards in a responsive grid (`grid-cols-1 sm:grid-cols-3`), placed inside footer above the existing column grid.

## File Summary
Create ~22 files (3 shared portal components, ~6 patient pages, ~9 doctor pages, ~6 org pages, 3 mock-data files). Edit 2 files (`App.tsx`, `SiteFooter.tsx`).
// Realistic mock data shared across portals
export const patientMock = {
  profile: {
    name: "Adaobi Okeke",
    email: "adaobi.okeke@example.com",
    phone: "+234 803 555 0188",
    dob: "1992-04-17",
    gender: "Female",
    blood: "O+",
    address: "12 Bourdillon Road, Ikoyi, Lagos",
  },
  stats: {
    upcoming: 2,
    past: 14,
    prescriptions: 6,
    balanceNGN: 24500,
  },
  appointments: [
    {
      id: "apt_001",
      doctor: "Dr. Chinedu Eze",
      specialty: "General Practitioner",
      date: "2026-05-15",
      time: "10:30",
      mode: "Video",
      status: "confirmed" as const,
      notes: "Follow-up on blood pressure medication.",
    },
    {
      id: "apt_002",
      doctor: "Dr. Funmi Adebayo",
      specialty: "Dermatology",
      date: "2026-05-22",
      time: "14:00",
      mode: "Video",
      status: "pending" as const,
      notes: "Skin assessment.",
    },
    {
      id: "apt_003",
      doctor: "Dr. Ibrahim Musa",
      specialty: "Cardiology",
      date: "2026-04-28",
      time: "09:00",
      mode: "In-person",
      status: "completed" as const,
      notes: "ECG reviewed, normal sinus rhythm.",
    },
  ],
  records: [
    {
      id: "rec_001",
      date: "2026-04-28",
      title: "Cardiology Consultation",
      doctor: "Dr. Ibrahim Musa",
      diagnosis: "Stage 1 Hypertension",
      treatment: "Lisinopril 10mg daily, lifestyle changes",
      attachments: ["ECG_Report.pdf", "Lab_Panel.pdf"],
    },
    {
      id: "rec_002",
      date: "2026-03-12",
      title: "Annual Wellness Visit",
      doctor: "Dr. Chinedu Eze",
      diagnosis: "Healthy",
      treatment: "Routine vitamin D supplementation",
      attachments: ["Wellness_Summary.pdf"],
    },
    {
      id: "rec_003",
      date: "2026-01-09",
      title: "Acute Sinusitis",
      doctor: "Dr. Chinedu Eze",
      diagnosis: "Viral sinusitis",
      treatment: "Saline rinse, rest, hydration",
      attachments: [],
    },
  ],
  prescriptions: [
    {
      id: "rx_001",
      medication: "Lisinopril 10mg",
      dosage: "1 tablet daily",
      doctor: "Dr. Ibrahim Musa",
      date: "2026-04-28",
      status: "active" as const,
      refills: 2,
    },
    {
      id: "rx_002",
      medication: "Vitamin D3 2000 IU",
      dosage: "1 capsule daily",
      doctor: "Dr. Chinedu Eze",
      date: "2026-03-12",
      status: "active" as const,
      refills: 5,
    },
    {
      id: "rx_003",
      medication: "Amoxicillin 500mg",
      dosage: "1 capsule 3x daily x 7 days",
      doctor: "Dr. Chinedu Eze",
      date: "2026-01-09",
      status: "completed" as const,
      refills: 0,
    },
  ],
  payments: [
    { id: "p_001", date: "2026-04-28", description: "Cardiology Consultation", amount: 18000, status: "paid" as const, method: "HMO" },
    { id: "p_002", date: "2026-03-12", description: "Wellness Visit", amount: 12000, status: "paid" as const, method: "Card" },
    { id: "p_003", date: "2026-05-15", description: "Upcoming consultation", amount: 15000, status: "pending" as const, method: "HMO" },
  ],
};

export const doctorMock = {
  profile: {
    name: "Dr. Chinedu Eze",
    specialty: "General Practitioner",
    license: "MDCN/24812",
  },
  stats: {
    todayAppointments: 6,
    weekConsultations: 28,
    activePatients: 142,
    pendingNotes: 3,
  },
  todaySchedule: [
    { id: "c_001", time: "09:00", patient: "Adaobi Okeke", reason: "Hypertension follow-up", status: "in_progress" as const },
    { id: "c_002", time: "09:45", patient: "Tunde Bakare", reason: "Persistent cough", status: "scheduled" as const },
    { id: "c_003", time: "10:30", patient: "Ngozi Eze", reason: "Migraine review", status: "scheduled" as const },
    { id: "c_004", time: "11:15", patient: "Yusuf Lawal", reason: "Diabetes check-in", status: "scheduled" as const },
    { id: "c_005", time: "14:00", patient: "Blessing Okafor", reason: "Skin rash", status: "scheduled" as const },
    { id: "c_006", time: "15:30", patient: "Samuel Idris", reason: "Annual physical", status: "scheduled" as const },
  ],
  patients: [
    { id: "pt_001", name: "Adaobi Okeke", age: 33, gender: "F", lastVisit: "2026-04-28", condition: "Hypertension" },
    { id: "pt_002", name: "Tunde Bakare", age: 41, gender: "M", lastVisit: "2026-04-21", condition: "Asthma" },
    { id: "pt_003", name: "Ngozi Eze", age: 29, gender: "F", lastVisit: "2026-04-15", condition: "Migraine" },
    { id: "pt_004", name: "Yusuf Lawal", age: 56, gender: "M", lastVisit: "2026-04-10", condition: "Type 2 Diabetes" },
    { id: "pt_005", name: "Blessing Okafor", age: 24, gender: "F", lastVisit: "2026-03-30", condition: "Eczema" },
    { id: "pt_006", name: "Samuel Idris", age: 47, gender: "M", lastVisit: "2026-03-22", condition: "Routine" },
  ],
  notifications: [
    { id: "n1", text: "Lab results available for Tunde Bakare", time: "10m ago" },
    { id: "n2", text: "Adaobi Okeke confirmed her 09:00 appointment", time: "1h ago" },
    { id: "n3", text: "New referral from Dr. Adebayo", time: "2h ago" },
  ],
};

export const orgMock = {
  org: {
    name: "Sterling HMO",
    plan: "Enterprise",
    members: 1284,
  },
  stats: {
    activeStaff: 1284,
    monthlyConsultations: 412,
    monthlySpendNGN: 8420000,
    utilizationPct: 67,
  },
  staff: [
    { id: "s_001", name: "Adaobi Okeke", department: "Engineering", email: "adaobi@sterling.com", status: "active" as const, joined: "2024-08-12" },
    { id: "s_002", name: "Tunde Bakare", department: "Operations", email: "tunde@sterling.com", status: "active" as const, joined: "2023-11-04" },
    { id: "s_003", name: "Ngozi Eze", department: "HR", email: "ngozi@sterling.com", status: "active" as const, joined: "2025-01-22" },
    { id: "s_004", name: "Yusuf Lawal", department: "Finance", email: "yusuf@sterling.com", status: "inactive" as const, joined: "2022-05-09" },
    { id: "s_005", name: "Blessing Okafor", department: "Marketing", email: "blessing@sterling.com", status: "active" as const, joined: "2024-03-17" },
  ],
  monthlyUsage: [
    { month: "Dec", consultations: 312 },
    { month: "Jan", consultations: 358 },
    { month: "Feb", consultations: 384 },
    { month: "Mar", consultations: 401 },
    { month: "Apr", consultations: 396 },
    { month: "May", consultations: 412 },
  ],
  departmentUsage: [
    { dept: "Engineering", consultations: 142 },
    { dept: "Operations", consultations: 96 },
    { dept: "HR", consultations: 48 },
    { dept: "Finance", consultations: 64 },
    { dept: "Marketing", consultations: 62 },
  ],
  invoices: [
    { id: "INV-2026-005", date: "2026-05-01", amount: 8420000, status: "paid" as const },
    { id: "INV-2026-004", date: "2026-04-01", amount: 7980000, status: "paid" as const },
    { id: "INV-2026-003", date: "2026-03-01", amount: 7640000, status: "paid" as const },
    { id: "INV-2026-002", date: "2026-02-01", amount: 7320000, status: "paid" as const },
    { id: "INV-2026-001", date: "2026-01-01", amount: 7100000, status: "paid" as const },
  ],
};

export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

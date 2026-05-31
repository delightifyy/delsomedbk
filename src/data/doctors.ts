export type TimeSlot = {
  day: string;
  slots: string[];
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  zone: string;
  state: string;
  city: string;
  bio: string;
  initials: string;
  yearsExperience: number;
  photo?: string;
  profile_url?: string;
  consultationFee: number;
  availability: TimeSlot[];
};

export const ZONES = ["North East", "North West", "South East", "South South", "South West"] as const;

export const SPECIALTY_MAP = {
  "Internal Medicine": [
    "Cardiology",
    "Endocrinology",
    "Gastroenterology",
    "Nephrology",
    "Pulmonology",
    "Rheumatology",
    "Haematology",
    "Infectious Diseases",
    "Oncology",
    "Geriatric Medicine",
    "Dermatology",
    "Neurology",
  ],
  "Surgery": [
    "Colorectal Surgery",
    "Vascular Surgery",
    "Trauma & Orthopaedic Surgery",
    "Breast Surgery",
    "Endocrine Surgery",
    "Transplant Surgery",
    "Hepatobiliary Surgery",
    "Neurosurgery",
    "Ophthalmology",
    "ENT",
  ],
  "Paediatrics": [
    "Neonatology (newborn care)",
    "Paediatric Cardiology",
    "Paediatric Neurology",
    "Paediatric Endocrinology",
    "Paediatric Oncology",
  ],
  "Obstetrics & Gynaecology": [
    "Maternal-Fetal Medicine",
    "Fertility Services",
    "Gynaecological Oncology",
    "Family Planning",
  ],
  "Psychiatry": [
    "Child Psychiatry",
    "Addiction Psychiatry",
    "Adult Psychiatry",
    "Geriatric Psychiatry",
    "Forensic Psychiatry",
  ],
  "Primary & Preventive Care": [
    "General Practice / Family Physician",
  ],
  "Dentistry": [],
  "Physiotherapy": [],
  "Others": [],
} as const;

export const SPECIALTIES = Object.keys(SPECIALTY_MAP) as (keyof typeof SPECIALTY_MAP)[];

const WEEKDAY_SLOTS: TimeSlot[] = [
  { day: "Monday", slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM"] },
  { day: "Tuesday", slots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:30 PM"] },
  { day: "Wednesday", slots: ["10:00 AM", "12:30 PM", "02:30 PM", "04:30 PM"] },
  { day: "Thursday", slots: ["09:30 AM", "11:30 AM", "02:00 PM", "04:00 PM"] },
  { day: "Friday", slots: ["09:00 AM", "10:30 AM", "12:00 PM", "03:00 PM"] },
  { day: "Saturday", slots: ["10:00 AM", "12:00 PM"] },
];

const EVENING_SLOTS: TimeSlot[] = [
  { day: "Monday", slots: ["02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"] },
  { day: "Tuesday", slots: ["02:00 PM", "04:00 PM", "06:00 PM"] },
  { day: "Wednesday", slots: ["03:00 PM", "05:00 PM", "06:30 PM"] },
  { day: "Thursday", slots: ["02:30 PM", "04:30 PM", "06:00 PM"] },
  { day: "Friday", slots: ["03:00 PM", "05:00 PM"] },
];

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Adaeze Okafor",
    specialty: "Paediatrics",
    zone: "South",
    state: "Lagos",
    city: "Ikeja",
    bio: "12+ years caring for children with warmth, patience and evidence-based medicine.",
    initials: "AO",
    yearsExperience: 12,
    consultationFee: 15000,
    availability: WEEKDAY_SLOTS,
  },
  {
    id: "d2",
    name: "Dr. Ibrahim Bello",
    specialty: "Cardiology",
    zone: "North",
    state: "Kano",
    city: "Kano",
    bio: "Consultant cardiologist focused on preventive heart care and hypertension management.",
    initials: "IB",
    yearsExperience: 16,
    consultationFee: 25000,
    availability: EVENING_SLOTS,
  },
  {
    id: "d3",
    name: "Dr. Chiamaka Eze",
    specialty: "Obstetrics & Gynaecology",
    zone: "East",
    state: "Enugu",
    city: "Enugu",
    bio: "Supporting women through every stage of life with compassionate, modern care.",
    initials: "CE",
    yearsExperience: 9,
    consultationFee: 20000,
    availability: WEEKDAY_SLOTS,
  },
  {
    id: "d4",
    name: "Dr. Tunde Akinwale",
    specialty: "Primary & Preventive Care",
    zone: "West",
    state: "Oyo",
    city: "Ibadan",
    bio: "Family doctor passionate about accessible primary healthcare for every household.",
    initials: "TA",
    yearsExperience: 7,
    consultationFee: 10000,
    availability: WEEKDAY_SLOTS,
  },
  {
    id: "d5",
    name: "Dr. Halima Suleiman",
    specialty: "Dermatology",
    zone: "North",
    state: "Abuja FCT",
    city: "Abuja",
    bio: "Skin, hair and nail specialist with a focus on melanin-rich skin care.",
    initials: "HS",
    yearsExperience: 10,
    consultationFee: 18000,
    availability: EVENING_SLOTS,
  },
  {
    id: "d6",
    name: "Dr. Emeka Nwankwo",
    specialty: "Psychiatry",
    zone: "East",
    state: "Anambra",
    city: "Onitsha",
    bio: "Psychiatrist offering judgement-free support for anxiety, depression and burnout.",
    initials: "EN",
    yearsExperience: 11,
    consultationFee: 22000,
    availability: EVENING_SLOTS,
  },
  {
    id: "d7",
    name: "Dr. Ngozi Adeyemi",
    specialty: "Internal Medicine",
    zone: "South",
    state: "Rivers",
    city: "Port Harcourt",
    bio: "Internist managing chronic conditions with a holistic, patient-first approach.",
    initials: "NA",
    yearsExperience: 14,
    consultationFee: 20000,
    availability: WEEKDAY_SLOTS,
  },
  {
    id: "d8",
    name: "Dr. Yusuf Mohammed",
    specialty: "Primary & Preventive Care",
    zone: "Central",
    state: "Plateau",
    city: "Jos",
    bio: "Family physician dedicated to long-term wellness for patients of all ages.",
    initials: "YM",
    yearsExperience: 8,
    consultationFee: 12000,
    availability: WEEKDAY_SLOTS,
  },
];

export type Advert = {
  id: string;
  title: string;
  sponsor: string;
  category: "Pharmacy" | "Diagnostics" | "Organization" | "Wellness" | "Hospital";
  zone: string;
  state: string;
  city: string;
  description: string;
};

export const ADVERTS: Advert[] = [
  { id: "a1", title: "Free BP Screening Week", sponsor: "HealthPlus Pharmacy", category: "Pharmacy", zone: "South", state: "Lagos", city: "Lekki", description: "Walk in for a complimentary blood pressure check, every weekday this month." },
  { id: "a2", title: "20% off Lab Tests", sponsor: "ClearPath Diagnostics", category: "Diagnostics", zone: "North", state: "Abuja FCT", city: "Abuja", description: "Comprehensive panels at a discount when you book through DesolMed referrals." },
  { id: "a3", title: "Family HMO Plans", sponsor: "Reliance HMO", category: "Organization", zone: "South", state: "Lagos", city: "Victoria Island", description: "Affordable coverage for households of 3 or more, starting from ₦25,000/year." },
  { id: "a4", title: "Wellness Retreat", sponsor: "Calm Clinic", category: "Wellness", zone: "West", state: "Oyo", city: "Ibadan", description: "Two-day mindfulness and stress management retreat for working professionals." },
  { id: "a5", title: "Maternity Package", sponsor: "Hope Hospital", category: "Hospital", zone: "East", state: "Enugu", city: "Enugu", description: "All-inclusive antenatal and delivery package with 24/7 specialist support." },
  { id: "a6", title: "Diabetes Care Bundle", sponsor: "MedPlus", category: "Pharmacy", zone: "Central", state: "Plateau", city: "Jos", description: "Glucose monitor, strips and a free nutrition consult in one bundle." },
];

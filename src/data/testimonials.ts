export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "Finding a verified pediatrician in Lagos used to take days of asking around. With DesolMed, I had three trusted options in five minutes.",
    name: "Adaobi Nnamdi",
    role: "Patient · Lagos",
    initials: "AN",
  },
  {
    id: "t2",
    quote: "DesolMed has helped me reach patients I would never have met through walk-ins alone. The verification process gives my profile real credibility.",
    name: "Dr. Tunde Akinwale",
    role: "GP · Ibadan",
    initials: "TA",
  },
  {
    id: "t3",
    quote: "We onboarded our 1,200 employees in a week. The directory makes it easy for staff to self-serve when they need a specialist.",
    name: "Fola Adebanjo",
    role: "HR Director · Kano",
    initials: "FA",
  },
  {
    id: "t4",
    quote: "Clean interface, no clutter, and every doctor is actually licensed. That's rare in this space.",
    name: "Dr. Halima Suleiman",
    role: "Dermatologist · Abuja",
    initials: "HS",
  },
];

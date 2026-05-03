import blog1 from "@/assets/blog/blog-1.jpg";
import blog2 from "@/assets/blog/blog-2.jpg";
import blog3 from "@/assets/blog/blog-3.jpg";
import blog4 from "@/assets/blog/blog-4.jpg";
import blog5 from "@/assets/blog/blog-5.jpg";
import blog6 from "@/assets/blog/blog-6.jpg";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Wellness" | "Nutrition" | "Mental Health" | "Maternity" | "Paediatrics" | "Telehealth";
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  cover: string;
  featured?: boolean;
};

export const BLOG_CATEGORIES = [
  "Wellness",
  "Nutrition",
  "Mental Health",
  "Maternity",
  "Paediatrics",
  "Telehealth",
] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    slug: "primary-care-changing-nigeria",
    title: "How primary care is quietly transforming healthcare in Nigeria",
    excerpt:
      "From rural clinics to urban telehealth hubs, a new generation of family doctors is rebuilding trust between patients and the system — one consultation at a time.",
    category: "Wellness",
    author: "Dr. Adaeze Okafor",
    authorRole: "Family Physician",
    date: "Apr 18, 2026",
    readTime: "8 min read",
    cover: blog1,
    featured: true,
  },
  {
    id: "b2",
    slug: "heart-healthy-nigerian-foods",
    title: "Eight everyday Nigerian foods that protect your heart",
    excerpt:
      "Hypertension is on the rise — but the kitchen can be your first line of defence. A look at the local staples that quietly do the work.",
    category: "Nutrition",
    author: "Dr. Ibrahim Bello",
    authorRole: "Cardiologist",
    date: "Apr 11, 2026",
    readTime: "6 min read",
    cover: blog2,
  },
  {
    id: "b3",
    slug: "burnout-young-professionals",
    title: "The quiet epidemic: burnout among young Nigerian professionals",
    excerpt:
      "It's more than tiredness. We talk to therapists about why so many high performers are crashing — and what actually helps.",
    category: "Mental Health",
    author: "Dr. Emeka Nwankwo",
    authorRole: "Psychiatrist",
    date: "Apr 04, 2026",
    readTime: "10 min read",
    cover: blog3,
  },
  {
    id: "b4",
    slug: "antenatal-care-modern-mums",
    title: "What modern antenatal care should look like in 2026",
    excerpt:
      "Beyond the monthly check-up: how technology, nutrition and continuous monitoring are reshaping pregnancy care.",
    category: "Maternity",
    author: "Dr. Chiamaka Eze",
    authorRole: "Obstetrician",
    date: "Mar 28, 2026",
    readTime: "7 min read",
    cover: blog4,
  },
  {
    id: "b5",
    slug: "child-vaccination-myths",
    title: "Childhood vaccinations: separating myth from medicine",
    excerpt:
      "A paediatrician answers the questions parents are too polite to ask — and explains why the schedule looks the way it does.",
    category: "Paediatrics",
    author: "Dr. Ngozi Adeyemi",
    authorRole: "Paediatrician",
    date: "Mar 21, 2026",
    readTime: "5 min read",
    cover: blog5,
  },
  {
    id: "b6",
    slug: "telemedicine-everyday-nigerians",
    title: "Telemedicine, demystified: when a video call beats the queue",
    excerpt:
      "Not every visit needs a waiting room. A practical guide to choosing between virtual and in-person care.",
    category: "Telehealth",
    author: "Dr. Tunde Akinwale",
    authorRole: "General Practitioner",
    date: "Mar 14, 2026",
    readTime: "6 min read",
    cover: blog6,
  },
];

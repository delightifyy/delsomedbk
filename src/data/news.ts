export type NewsArticle = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string[];
  author?: string;
};

export const NEWS: NewsArticle[] = [
  {
    slug: "who-maternal-health-guidelines-africa",
    title: "WHO Releases New Guidelines on Maternal Health in Africa",
    category: "Public Health",
    date: "April 22, 2026",
    author: "DesolMed Editorial",
    excerpt:
      "The World Health Organization unveils updated maternal care standards aimed at reducing preventable deaths across Sub-Saharan Africa.",
    body: [
      "The World Health Organization (WHO) has released a comprehensive update to its maternal health guidelines, with a strong focus on Sub-Saharan Africa where maternal mortality remains disproportionately high.",
      "The new framework emphasizes early antenatal screening, skilled birth attendance, and timely emergency obstetric care. It also calls on member states to strengthen referral pathways between primary health centres and tertiary hospitals.",
      "Health ministers from Nigeria, Ghana, Kenya and Rwanda endorsed the guidelines and committed to integrating them into national maternal and child health programs over the next 18 months.",
      "Experts say successful implementation could prevent tens of thousands of preventable deaths each year and significantly improve newborn outcomes across the region.",
    ],
  },
  {
    slug: "nigeria-nhia-coverage-expansion",
    title: "Nigeria Expands National Health Insurance Coverage",
    category: "Policy",
    date: "April 18, 2026",
    author: "DesolMed Editorial",
    excerpt:
      "New reforms extend NHIA enrolment to informal sector workers, with HMOs onboarding millions of new beneficiaries.",
    body: [
      "The National Health Insurance Authority (NHIA) has rolled out a major reform extending coverage to Nigeria's vast informal sector, including artisans, traders and gig workers.",
      "Registered HMOs — including several DesolMed network partners — are working to onboard new beneficiaries through community drives and digital enrolment portals.",
      "The expansion is part of a broader push toward universal health coverage, with subsidies available for low-income enrollees and dedicated plans for vulnerable groups.",
      "Stakeholders welcomed the move but cautioned that strong oversight and provider accreditation will be essential to maintaining quality of care.",
    ],
  },
  {
    slug: "sickle-cell-gene-therapy-breakthrough",
    title: "Breakthrough in Sickle Cell Gene Therapy Trials",
    category: "Research",
    date: "April 10, 2026",
    author: "DesolMed Editorial",
    excerpt:
      "Lagos-based researchers report promising results from a phase-II trial offering new hope for sickle cell patients.",
    body: [
      "A team of researchers in Lagos has reported encouraging phase-II results from a gene therapy trial targeting sickle cell disease, one of the most common inherited disorders in Nigeria.",
      "Early data suggests significant reductions in painful vaso-occlusive crises and hospital admissions among trial participants over a 12-month follow-up period.",
      "If confirmed in larger trials, the therapy could transform care for millions of patients across West Africa, where sickle cell disease places a heavy burden on families and the health system.",
      "The team is now seeking additional funding and regulatory clearance to expand the trial to multiple sites across the country.",
    ],
  },
  {
    slug: "telemedicine-adoption-nigeria",
    title: "Telemedicine Adoption Surges Among Nigerian Clinicians",
    category: "Digital Health",
    date: "April 5, 2026",
    author: "DesolMed Editorial",
    excerpt:
      "Verified doctors are increasingly using digital platforms to reach patients across borders and underserved regions.",
    body: [
      "A new survey shows a sharp rise in telemedicine adoption among Nigerian clinicians, driven by smartphone penetration and growing patient comfort with virtual consultations.",
      "Doctors report using secure platforms to consult with patients in rural areas, follow up on chronic conditions, and coordinate care with specialists abroad.",
      "Industry observers note that platforms emphasizing verified credentials and encrypted communication are seeing the fastest growth, as patients prioritize trust and data privacy.",
      "DesolMed's network model — focused on discovery and verified profiles — fits squarely within this trend, helping patients connect with the right doctor for their needs.",
    ],
  },
];

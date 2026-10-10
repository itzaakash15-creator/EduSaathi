import type {
  Opportunity,
  Application,
  VaultDocument,
  NotificationItem,
  AdminStats,
  UserProfile,
} from "./types";
import { REAL_SCHEMES } from "./schemes-data";
import { enrichOpportunities } from "./eligibility";

export const DEMO_USER: UserProfile = {
  uid: "demo-user-001",
  name: "Aakash K",
  email: "itzaakash15@gmail.com",
  age: 21,
  country: "India",
  state: "Andhra Pradesh",
  occupation: "Student",
  education: "B.Tech Computer Science (2nd Year)",
  income: "₹4–8 Lakh",
  skills: ["Python", "React", "Machine Learning", "Public Speaking"],
  interests: ["Scholarships", "Internships", "Startup Grants", "Research"],
  disabilityStatus: "None",
  category: "General",
  photoURL: undefined,
  profileComplete: true,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-08-01T08:30:00Z",
};

/** Real Indian government schemes with profile-based eligibility for the demo user */
export const OPPORTUNITIES: Opportunity[] = enrichOpportunities(
  REAL_SCHEMES,
  DEMO_USER
);

export const APPLICATIONS: Application[] = [
  {
    id: "app-001",
    opportunityId: "nsp-post-matric",
    opportunityTitle: "National Scholarship Portal — Post Matric Scholarship",
    organization: "Ministry of Education",
    status: "Submitted",
    submittedAt: "2026-07-18T14:20:00Z",
    updatedAt: "2026-07-28T09:00:00Z",
    notes: "Awaiting institute verification",
    nextStep: "Follow up with college scholarship cell",
  },
  {
    id: "app-002",
    opportunityId: "pm-internship",
    opportunityTitle: "PM Internship Scheme",
    organization: "Ministry of Corporate Affairs",
    status: "Draft",
    updatedAt: "2026-08-01T11:15:00Z",
    notes: "Resume uploaded; need bonafide certificate",
    nextStep: "Upload bonafide certificate and submit",
  },
  {
    id: "app-003",
    opportunityId: "sih-2026",
    opportunityTitle: "Smart India Hackathon 2026",
    organization: "AICTE / Ministry of Education",
    status: "Under Review",
    submittedAt: "2026-07-22T16:45:00Z",
    updatedAt: "2026-07-30T10:00:00Z",
    notes: "Idea submitted for software edition",
    nextStep: "Prepare for shortlisting announcement",
  },
  {
    id: "app-004",
    opportunityId: "pmkvy",
    opportunityTitle: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
    organization: "MSDE",
    status: "Approved",
    submittedAt: "2026-06-10T12:00:00Z",
    updatedAt: "2026-06-25T08:30:00Z",
    notes: "Enrolled in Advanced Python course",
    nextStep: "Complete assessment by August 15",
  },
  {
    id: "app-005",
    opportunityId: "startup-india-seed",
    opportunityTitle: "Startup India Seed Fund Scheme",
    organization: "DPIIT",
    status: "Rejected",
    submittedAt: "2026-05-02T09:00:00Z",
    updatedAt: "2026-05-20T15:00:00Z",
    notes: "Startup not yet DPIIT recognized",
    nextStep: "Obtain DPIIT recognition and reapply",
  },
];

export const VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "doc-001",
    name: "Aakash_K_Resume.pdf",
    type: "Resume",
    size: "248 KB",
    uploadedAt: "2026-07-12T10:00:00Z",
    verified: true,
  },
  {
    id: "doc-002",
    name: "Aadhaar_Card.pdf",
    type: "Aadhaar",
    size: "1.2 MB",
    uploadedAt: "2026-07-12T10:05:00Z",
    verified: true,
  },
  {
    id: "doc-003",
    name: "Income_Certificate_2026.pdf",
    type: "Income Certificate",
    size: "890 KB",
    uploadedAt: "2026-07-15T14:20:00Z",
    verified: true,
  },
  {
    id: "doc-004",
    name: "Semester_4_Marksheet.pdf",
    type: "Mark Sheet",
    size: "640 KB",
    uploadedAt: "2026-07-20T09:30:00Z",
    verified: false,
  },
  {
    id: "doc-005",
    name: "Passport_Scan.pdf",
    type: "Passport",
    size: "2.1 MB",
    uploadedAt: "2026-06-01T16:00:00Z",
    verified: true,
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-001",
    title: "Deadline approaching",
    message: "PM Internship Scheme — check the MCA portal for the current batch window.",
    type: "deadline",
    read: false,
    createdAt: "2026-08-03T08:00:00Z",
    href: "/opportunities/pm-internship",
  },
  {
    id: "n-002",
    title: "New matching opportunity",
    message: "Smart India Hackathon 2026 matches your CS skills and interests.",
    type: "match",
    read: false,
    createdAt: "2026-08-02T18:30:00Z",
    href: "/opportunities/sih-2026",
  },
  {
    id: "n-003",
    title: "Improve your eligibility score",
    message: "Add your Class XII percentile to unlock more NSP scholarships.",
    type: "profile",
    read: true,
    createdAt: "2026-08-01T12:00:00Z",
    href: "/profile",
  },
  {
    id: "n-004",
    title: "Application update",
    message: "Your Post Matric Scholarship is awaiting institute verification on NSP.",
    type: "system",
    read: true,
    createdAt: "2026-07-28T09:15:00Z",
    href: "/tracker",
  },
  {
    id: "n-005",
    title: "Deadline reminder",
    message: "SIH 2026 registration — confirm dates on sih.gov.in.",
    type: "deadline",
    read: false,
    createdAt: "2026-08-03T07:00:00Z",
    href: "/opportunities/sih-2026",
  },
];

export const ADMIN_STATS: AdminStats = {
  totalUsers: 18420,
  totalOpportunities: REAL_SCHEMES.length,
  applicationsSubmitted: 9321,
  aiQueriesToday: 2847,
  activeSchemes: REAL_SCHEMES.length,
  verificationRate: 97.4,
};

export const CATEGORIES = [
  { name: "Scholarship", count: 8, icon: "GraduationCap" },
  { name: "Internship", count: 2, icon: "Briefcase" },
  { name: "Research", count: 2, icon: "FlaskConical" },
  { name: "Hackathon", count: 1, icon: "Code2" },
  { name: "Startup Grant", count: 4, icon: "Rocket" },
  { name: "Women Scheme", count: 2, icon: "Heart" },
  { name: "Farmer Scheme", count: 5, icon: "Wheat" },
  { name: "Healthcare", count: 2, icon: "Stethoscope" },
  { name: "Housing", count: 2, icon: "Home" },
  { name: "Education", count: 2, icon: "BookOpen" },
  { name: "Welfare", count: 6, icon: "HandHeart" },
  { name: "Skill Development", count: 4, icon: "Wrench" },
] as const;

export const IMPACT_STATS = [
  { label: "Verified Schemes Indexed", value: `${REAL_SCHEMES.length}+` },
  { label: "Official Portals Linked", value: "35+" },
  { label: "Avg. Discovery Time", value: "3 min" },
  { label: "Verified Sources", value: "100%" },
];

export const TESTIMONIALS = [
  {
    name: "Priya Nair",
    role: "Engineering Student, Kerala",
    quote:
      "I found three scholarships I never knew existed. EduSaathi explained eligibility in plain English and I got my first award within a semester.",
  },
  {
    name: "Rahul Mehta",
    role: "First-time Founder, Gujarat",
    quote:
      "Government grant pages used to overwhelm me. The document explainer turned a 40-page notification into a clear checklist in minutes.",
  },
  {
    name: "Fatima Begum",
    role: "Homemaker & SHG Member, Telangana",
    quote:
      "I finally understood which welfare schemes my family qualifies for. The reminders meant we didn’t miss a single deadline.",
  },
];

export const FAQ_ITEMS = [
  {
    question: "Is EduSaathi free to use?",
    answer:
      "Yes. Core discovery, eligibility checks, and document explanations are free for students and citizens. Advanced team and institutional plans are available for organizations.",
  },
  {
    question: "Where does the opportunity data come from?",
    answer:
      "We index verified government portals such as MyScheme, NSP (scholarships.gov.in), PM-KISAN, PM-JAY, Startup India, SIH, DigiLocker, and ministry notifications. Every listing links to the official URL.",
  },
  {
    question: "How accurate is the eligibility checker?",
    answer:
      "Eligibility is computed from your profile against published criteria. Results are advisory—always confirm on the official portal before applying.",
  },
  {
    question: "Is my personal data safe?",
    answer:
      "Profiles and documents are stored securely with Firebase Authentication and Firestore security rules. We never sell personal data.",
  },
  {
    question: "Can I upload government PDFs in regional languages?",
    answer:
      "Yes. Our AI can summarize notifications in English and explain key sections even when source documents use formal bureaucratic language.",
  },
  {
    question: "Does EduSaathi submit applications for me?",
    answer:
      "No. We guide you with roadmaps and checklists. Final submission always happens on the official government or institutional portal.",
  },
];

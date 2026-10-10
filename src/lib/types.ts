export type OpportunityCategory =
  | "Scholarship"
  | "Internship"
  | "Research"
  | "Hackathon"
  | "Startup Grant"
  | "Women Scheme"
  | "Farmer Scheme"
  | "Healthcare"
  | "Housing"
  | "Education"
  | "Welfare"
  | "Skill Development";

export type EligibilityStatus = "Eligible" | "Likely Eligible" | "Not Eligible";

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected";

export type DocumentType =
  | "Resume"
  | "Aadhaar"
  | "Income Certificate"
  | "Mark Sheet"
  | "Passport"
  | "Caste Certificate"
  | "Other";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: number;
  country: string;
  state: string;
  occupation: string;
  education: string;
  income: string;
  skills: string[];
  interests: string[];
  disabilityStatus?: string;
  category?: string;
  photoURL?: string;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  deadline: string;
  amount?: string;
  location: string;
  officialUrl: string;
  verified: boolean;
  tags: string[];
  matchScore?: number;
  eligibilityStatus?: EligibilityStatus;
  eligibilityReasons?: string[];
  applicationSteps?: string[];
  commonMistakes?: string[];
  faqs?: { question: string; answer: string }[];
  publishedAt: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  notes?: string;
  nextStep?: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadedAt: string;
  verified: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "match" | "profile" | "system";
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DocumentExplanation {
  summary: string;
  eligibility: string[];
  requiredDocuments: string[];
  deadline: string;
  importantNotes: string[];
  actionChecklist: string[];
  faqs: { question: string; answer: string }[];
}

export interface CareerAdvice {
  skills: string[];
  certifications: string[];
  courses: { title: string; provider: string; reason: string }[];
  projects: string[];
  eligibilityImpact: string;
}

export interface ApplicationRoadmap {
  opportunityTitle: string;
  steps: {
    title: string;
    description: string;
    estimatedDays: number;
    documents: string[];
    tips: string[];
  }[];
  totalDays: number;
  successTips: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalOpportunities: number;
  applicationsSubmitted: number;
  aiQueriesToday: number;
  activeSchemes: number;
  verificationRate: number;
}

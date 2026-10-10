import type {
  CareerAdvice,
  DocumentExplanation,
  ApplicationRoadmap,
  ChatMessage,
  Opportunity,
  UserProfile,
} from "./types";
import { OPPORTUNITIES, DEMO_USER } from "./mock-data";
import { REAL_SCHEMES } from "./schemes-data";
import { enrichOpportunity, enrichOpportunities } from "./eligibility";

// Same-origin on Vercel (services rewrite /api + /health). Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8001");

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function searchOpportunities(
  query: string,
  category?: string,
  profile?: UserProfile | null
): Opportunity[] {
  const q = query.toLowerCase();
  const base = enrichOpportunities(REAL_SCHEMES, profile || DEMO_USER);
  return base.filter((opp) => {
    const matchesCategory = !category || category === "All" || opp.category === category;
    const matchesQuery =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q) ||
      opp.tags.some((t) => t.includes(q)) ||
      opp.organization.toLowerCase().includes(q) ||
      opp.category.toLowerCase().includes(q) ||
      naturalLanguageMatch(q, opp);
    return matchesCategory && matchesQuery;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

function naturalLanguageMatch(q: string, opp: Opportunity): boolean {
  if (q.includes("engineering") || q.includes("student")) {
    return ["Scholarship", "Internship", "Hackathon", "Education", "Skill Development"].includes(
      opp.category
    );
  }
  if (q.includes("women") || q.includes("entrepreneur")) {
    return opp.category === "Women Scheme" || opp.category === "Startup Grant";
  }
  if (q.includes("8 lakh") || q.includes("income") || q.includes("scholarship")) {
    return opp.category === "Scholarship" || opp.eligibility.some((e) => e.toLowerCase().includes("income"));
  }
  if (q.includes("farmer") || q.includes("agriculture")) {
    return opp.category === "Farmer Scheme";
  }
  if (q.includes("health")) {
    return opp.category === "Healthcare";
  }
  if (q.includes("andhra")) {
    return opp.location.includes("Pan India") || opp.location.includes("Andhra");
  }
  return false;
}

export function getOpportunity(
  id: string,
  profile?: UserProfile | null
): Opportunity | undefined {
  const raw = REAL_SCHEMES.find((o) => o.id === id) || OPPORTUNITIES.find((o) => o.id === id);
  if (!raw) return undefined;
  return enrichOpportunity(raw, profile || DEMO_USER);
}

export function getRecommended(profile?: UserProfile | null): Opportunity[] {
  return enrichOpportunities(REAL_SCHEMES, profile || DEMO_USER);
}

export async function explainDocument(
  text: string
): Promise<DocumentExplanation> {
  const remote = await apiFetch<DocumentExplanation>("/api/ai/explain-document", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  if (remote) return remote;

  return {
    summary:
      "This government notification outlines a public benefit or opportunity scheme, including who can apply, what support is offered, and how to submit an application through the official portal.",
    eligibility: [
      "Applicant must be an Indian citizen with valid identity proof",
      "Income and category criteria as stated in the notification",
      "Enrollment or occupational status matching the scheme scope",
      "Submission before the published deadline",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Income Certificate (if income-based)",
      "Educational / occupational proof",
      "Bank passbook or cancelled cheque",
      "Passport-size photograph",
    ],
    deadline: "Refer to the notification — typically 30–60 days from publication",
    importantNotes: [
      "Only applications on the official portal are valid",
      "Keep scanned documents under the specified file size",
      "Name on Aadhaar and bank account must match",
      "Beware of third-party agents charging fees for free schemes",
    ],
    actionChecklist: [
      "Confirm eligibility against each criterion",
      "Collect and scan all required documents",
      "Create / login to the official portal account",
      "Fill the form carefully and review before submit",
      "Note the application reference number",
      "Set a calendar reminder for verification follow-up",
    ],
    faqs: [
      {
        question: "Is there an application fee?",
        answer:
          "Most government schemes are free to apply. Ignore any website asking for payment unless the official notification explicitly mentions a fee.",
      },
      {
        question: "What if my documents are in a regional language?",
        answer:
          "Many portals accept regional documents. If English translation is required, get it notarized as specified.",
      },
      {
        question: "Can I edit after submission?",
        answer:
          "Usually limited edits are allowed before institute/authority verification. Check the portal’s edit window.",
      },
    ],
  };
}

export async function generateRoadmap(
  opportunityId: string,
  profile?: UserProfile | null,
  options?: { preferAi?: boolean }
): Promise<ApplicationRoadmap> {
  const opp = getOpportunity(opportunityId, profile);
  const local = buildLocalRoadmap(opp);

  // Instant path by default — AI is optional (slow network round-trip)
  if (!options?.preferAi) {
    return local;
  }

  const remote = await apiFetch<ApplicationRoadmap>("/api/ai/roadmap", {
    method: "POST",
    body: JSON.stringify({ opportunity_id: opportunityId, profile }),
    signal: AbortSignal.timeout(12000),
  });
  if (remote?.steps?.length) return remote;
  return local;
}

function buildLocalRoadmap(opp: Opportunity | undefined): ApplicationRoadmap {
  const title = opp?.title || "Selected Opportunity";
  const portal = opp?.officialUrl
    ? new URL(opp.officialUrl).hostname.replace(/^www\./, "")
    : "the official portal";
  const docs = opp?.documents?.length
    ? opp.documents
    : ["Aadhaar", "Income Certificate", "Bank passbook"];
  const stepsFromScheme = opp?.applicationSteps || [];

  const steps =
    stepsFromScheme.length >= 3
      ? stepsFromScheme.map((stepTitle, i) => {
          const estimatedDays = i === 0 ? 1 : i === stepsFromScheme.length - 1 ? 5 : 2;
          return {
            title: stepTitle,
            description:
              i === 0
                ? `Confirm you meet published criteria for ${title}, then start on ${portal}.`
                : i === stepsFromScheme.length - 1
                  ? `Submit on ${portal}, save the reference ID, and track verification status.`
                  : `Complete this stage carefully. Keep names matching across Aadhaar, bank, and application fields.`,
            estimatedDays,
            documents: i === 1 ? docs : i === 0 ? ["Aadhaar", "Profile details"] : docs.slice(0, 3),
            tips: (opp?.commonMistakes || []).slice(0, 2).length
              ? (opp?.commonMistakes || []).slice(0, 2).map((m) => `Avoid: ${m}`)
              : ["Keep PDF scans under portal size limits", "Enable SMS alerts from the portal"],
          };
        })
      : [
          {
            title: "Confirm eligibility",
            description: `Review each criterion for ${title} against your profile.`,
            estimatedDays: 1,
            documents: ["Profile details", "Identity proof"],
            tips: ["Screenshot official eligibility text for reference"],
          },
          {
            title: "Assemble documents",
            description: "Collect, scan, and name documents clearly.",
            estimatedDays: 3,
            documents: docs,
            tips: ["Use PDF under 1–2 MB", "Ensure names match across documents"],
          },
          {
            title: `Register on ${portal}`,
            description: `Create / login on the official portal and complete KYC.`,
            estimatedDays: 1,
            documents: ["Aadhaar", "Mobile number", "Email"],
            tips: ["Enable SMS/email alerts from the portal"],
          },
          {
            title: "Fill and submit application",
            description: "Enter details carefully, upload files, and submit before the deadline.",
            estimatedDays: 3,
            documents: docs,
            tips: ["Save draft frequently", "Never share OTP with agents"],
          },
          {
            title: "Track verification",
            description: "Monitor status and respond to institute/authority queries quickly.",
            estimatedDays: 7,
            documents: ["Application receipt"],
            tips: ["Follow up with the nodal officer if stuck"],
          },
        ];

  const totalDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);

  return {
    opportunityTitle: title,
    totalDays,
    steps,
    successTips: [
      opp?.deadline
        ? `Official deadline listed: ${opp.deadline} — apply at least 7 days earlier`
        : "Apply at least 7 days before the deadline",
      `Use only the official portal: ${opp?.officialUrl || portal}`,
      "Keep digital and physical copies of every upload",
      "Never share OTP or passwords with agents",
      ...(opp?.commonMistakes?.slice(0, 2).map((m) => `Watch out: ${m}`) || []),
    ],
  };
}

export async function getCareerAdvice(
  profile?: UserProfile | null
): Promise<CareerAdvice> {
  const remote = await apiFetch<CareerAdvice>("/api/ai/career-advice", {
    method: "POST",
    body: JSON.stringify({ profile: profile || DEMO_USER }),
  });
  if (remote) return remote;

  return {
    skills: [
      "Data Structures & Algorithms",
      "Cloud fundamentals (AWS/GCP)",
      "Technical writing for grant proposals",
      "System design basics",
    ],
    certifications: [
      "Google Data Analytics Certificate",
      "AWS Cloud Practitioner",
      "NPTEL Machine Learning",
    ],
    courses: [
      {
        title: "Full-Stack Web Development",
        provider: "NASSCOM Futureskills / freeCodeCamp",
        reason: "Strengthens internship and hackathon competitiveness",
      },
      {
        title: "Research Methodology",
        provider: "SWAYAM / NPTEL",
        reason: "Improves readiness for fellowships and INSPIRE-track paths",
      },
      {
        title: "Startup Finance Basics",
        provider: "Startup India Learning Program",
        reason: "Helps qualify for seed fund documentation quality",
      },
    ],
    projects: [
      "Build a campus grievance chatbot and publish on GitHub",
      "Contribute to an open-source civic-tech repository",
      "Complete a Kaggle beginner notebook with a public write-up",
    ],
    eligibilityImpact:
      "Completing 2 certifications and 1 public project can raise your internship and scholarship match scores by an estimated 8–12 points.",
  };
}

export async function chatWithAssistant(
  messages: { role: string; content: string }[],
  profile?: UserProfile | null
): Promise<string> {
  const remote = await apiFetch<{ reply: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, profile: profile || DEMO_USER }),
  });
  if (remote?.reply) return remote.reply;

  const last = messages[messages.length - 1]?.content.toLowerCase() || "";
  const eligible = OPPORTUNITIES.filter(
    (o) => o.eligibilityStatus === "Eligible" || o.eligibilityStatus === "Likely Eligible"
  );

  if (last.includes("eligible") || last.includes("schemes")) {
    return `Based on your profile (${profile?.education || DEMO_USER.education}, ${profile?.state || DEMO_USER.state}, income ${profile?.income || DEMO_USER.income}), you currently match well with:\n\n${eligible
      .slice(0, 4)
      .map(
        (o) =>
          `• **${o.title}** (${o.eligibilityStatus}, ${o.matchScore}% match) — deadline ${o.deadline}`
      )
      .join(
        "\n"
      )}\n\nI recommend starting with the highest match scores and confirming documents in your vault before applying.`;
  }

  if (last.includes("document")) {
    return `For most scholarships and internships matching your profile, keep these ready:\n\n• Aadhaar Card\n• Income Certificate (current FY)\n• Latest mark sheets\n• Student ID / Bonafide certificate\n• Bank passbook\n• Updated resume\n\nYour Document Vault already has ${5} files. Mark sheets pending verification should be re-uploaded as clear PDFs under 1 MB.`;
  }

  if (last.includes("deadline")) {
    const upcoming = [...OPPORTUNITIES]
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 4);
    return `Upcoming deadlines relevant to you:\n\n${upcoming
      .map((o) => `• **${o.title}** — ${o.deadline}`)
      .join(
        "\n"
      )}\n\nEnable notifications to get reminders 7 days and 48 hours before each deadline.`;
  }

  return `I can help you discover opportunities, check eligibility, explain government PDFs, build application roadmaps, and track deadlines.\n\nTry asking:\n• “What schemes am I eligible for?”\n• “What documents do I need for NSP?”\n• “When is the PM Internship deadline?”\n\nYour profile is set as ${profile?.name || DEMO_USER.name}, ${profile?.occupation || DEMO_USER.occupation} from ${profile?.state || DEMO_USER.state}.`;
}

export function createChatMessage(
  role: "user" | "assistant",
  content: string
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

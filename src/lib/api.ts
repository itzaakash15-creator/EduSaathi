import type {
  CareerAdvice,
  DocumentExplanation,
  ApplicationRoadmap,
  ChatMessage,
  Opportunity,
  UserProfile,
} from "./types";
import { DEMO_USER } from "./mock-data";
import { REAL_SCHEMES } from "./schemes-data";
import { enrichOpportunity, enrichOpportunities } from "./eligibility";

// Same-origin on Vercel (services rewrite /api + /health). Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8001");

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const endpoints: string[] = [];

  // If in browser, use relative path first (handled cleanly by Next.js rewrites, no CORS)
  if (typeof window !== "undefined") {
    endpoints.push(path);
  }

  // Include explicit configured API base if present
  if (process.env.NEXT_PUBLIC_API_URL) {
    endpoints.push(`${process.env.NEXT_PUBLIC_API_URL}${path}`);
  }

  // Direct backend port 8001 fallback
  endpoints.push(`http://localhost:8001${path}`);
  endpoints.push(`http://127.0.0.1:8001${path}`);

  const uniqueEndpoints = Array.from(new Set(endpoints));
  let lastError: Error | null = null;

  for (const url of uniqueEndpoints) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
      const errText = await res.text().catch(() => "");
      lastError = new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Failed to connect to EduSaathi AI API service on port 8001.");
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
  const raw = REAL_SCHEMES.find((o) => o.id === id);
  if (!raw) return undefined;
  return enrichOpportunity(raw, profile || DEMO_USER);
}


export function getRecommended(profile?: UserProfile | null): Opportunity[] {
  return enrichOpportunities(REAL_SCHEMES, profile || DEMO_USER);
}

export async function explainDocument(
  text: string
): Promise<DocumentExplanation> {
  return await apiFetch<DocumentExplanation>("/api/ai/explain-document", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function generateRoadmap(
  opportunityId: string,
  profile?: UserProfile | null
): Promise<ApplicationRoadmap> {
  return await apiFetch<ApplicationRoadmap>("/api/ai/roadmap", {
    method: "POST",
    body: JSON.stringify({
      opportunity_id: opportunityId,
      profile: profile || DEMO_USER,
    }),
  });
}

export async function getCareerAdvice(
  profile?: UserProfile | null
): Promise<CareerAdvice> {
  return await apiFetch<CareerAdvice>("/api/ai/career-advice", {
    method: "POST",
    body: JSON.stringify({ profile: profile || DEMO_USER }),
  });
}

export async function chatWithAssistant(
  messages: { role: string; content: string }[],
  profile?: UserProfile | null
): Promise<string> {
  const remote = await apiFetch<{ reply: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, profile: profile || DEMO_USER }),
  });
  if (remote?.reply) {
    return remote.reply;
  }
  throw new Error("No response received from EduSaathi AI service.");
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

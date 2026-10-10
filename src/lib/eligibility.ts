import type {
  EligibilityStatus,
  Opportunity,
  UserProfile,
} from "./types";

export interface EligibilityResult {
  matchScore: number;
  eligibilityStatus: EligibilityStatus;
  eligibilityReasons: string[];
}

function incomeMaxLakhs(income: string): number | null {
  const s = income.toLowerCase();
  if (!s) return null;
  if (s.includes("below") && s.includes("2.5")) return 2.5;
  if (s.includes("2.5") && s.includes("4")) return 4;
  if (s.includes("4") && s.includes("8")) return 8;
  if (s.includes("8") && s.includes("15")) return 15;
  if (s.includes("above") || s.includes("15+")) return 25;
  const nums = s.match(/(\d+(?:\.\d+)?)/g)?.map(Number) || [];
  if (nums.length) return Math.max(...nums);
  return null;
}

function isStudent(profile: UserProfile): boolean {
  return /student|b\.?tech|b\.?sc|b\.?a|m\.?tech|undergraduate|graduate|college|school/i.test(
    `${profile.occupation} ${profile.education}`
  );
}

function isWomanFocused(opp: Opportunity): boolean {
  return (
    opp.category === "Women Scheme" ||
    opp.tags.some((t) => /women|girl|mahila|pragati/i.test(t)) ||
    /women|girl|mahila|pragati|saksham|sukanya/i.test(opp.title)
  );
}

function mentionsFarmer(opp: Opportunity): boolean {
  return (
    opp.category === "Farmer Scheme" ||
    opp.tags.some((t) => /farmer|agriculture|kisan|crop/i.test(t))
  );
}

export function computeEligibility(
  opp: Opportunity,
  profile: UserProfile
): EligibilityResult {
  const reasons: string[] = [];
  let score = 48;
  const incomeCap = incomeMaxLakhs(profile.income);
  const student = isStudent(profile);
  const occupation = (profile.occupation || "").toLowerCase();
  const education = (profile.education || "").toLowerCase();
  const interests = profile.interests.map((i) => i.toLowerCase());
  const categoryLower = opp.category.toLowerCase();

  // Citizenship / location
  if (profile.country === "India" || !profile.country) {
    score += 8;
    reasons.push("You are applying as an Indian resident (citizenship assumed from profile)");
  }
  if (
    opp.location.includes("Pan India") ||
    (profile.state && opp.location.toLowerCase().includes(profile.state.toLowerCase()))
  ) {
    score += 6;
    reasons.push(`Location fits: scheme covers ${opp.location}`);
  }

  // Interest alignment
  if (
    interests.some(
      (i) =>
        categoryLower.includes(i.split(" ")[0]) ||
        opp.tags.some((t) => t.toLowerCase().includes(i.split(" ")[0])) ||
        opp.title.toLowerCase().includes(i.split(" ")[0])
    )
  ) {
    score += 10;
    reasons.push("Scheme aligns with your stated interests");
  }

  // Student / education tracks
  if (
    ["Scholarship", "Internship", "Hackathon", "Education", "Research", "Skill Development"].includes(
      opp.category
    )
  ) {
    if (student) {
      score += 14;
      reasons.push(`Your education/occupation (${profile.education || profile.occupation}) fits student-focused schemes`);
    } else {
      score -= 8;
      reasons.push("This scheme primarily targets students; your occupation may not fully match");
    }
  }

  // Farmer schemes
  if (mentionsFarmer(opp)) {
    if (/farmer|agricultur|kisan/.test(occupation)) {
      score += 18;
      reasons.push("Your occupation matches farmer/agriculture criteria");
    } else {
      score -= 20;
      reasons.push("Farmer schemes typically require landholding/farmer identity (e.g. PM-KISAN eligibility)");
    }
  }

  // Women-focused
  if (isWomanFocused(opp)) {
    score -= 12;
    reasons.push(
      "This scheme targets women beneficiaries — confirm gender eligibility on the official portal"
    );
  }

  // Startup / MSME
  if (opp.category === "Startup Grant" || /startup|mudra|udyam|msme|stand-up/i.test(opp.id)) {
    if (/founder|entrepreneur|startup|business|self-employed/.test(occupation)) {
      score += 16;
      reasons.push("Entrepreneur/startup profile aligns with grant and credit schemes");
    } else if (student) {
      score += 2;
      reasons.push("Students can explore Startup India learning paths; seed fund needs a registered startup");
    } else {
      score -= 6;
      reasons.push("Startup grants usually need DPIIT recognition / business registration");
    }
  }

  // Housing / welfare / healthcare — broad citizen schemes
  if (["Housing", "Healthcare", "Welfare"].includes(opp.category)) {
    score += 8;
    reasons.push("Broad citizen welfare/health/housing schemes often apply based on SECC/income/occupation");
  }

  // Income-sensitive scholarships
  if (opp.category === "Scholarship" || /nsp|scholarship|csss|pragati|saksham|nmms/i.test(opp.id)) {
    if (incomeCap !== null && incomeCap <= 8) {
      score += 12;
      reasons.push(`Family income band (${profile.income}) is within typical ₹8 lakh scholarship ceilings`);
    } else if (incomeCap !== null && incomeCap > 8) {
      score -= 15;
      reasons.push(`Family income (${profile.income}) may exceed income caps for many central scholarships`);
    }
  }

  // Disability-linked (Saksham)
  if (/saksham|disability/i.test(opp.id + opp.title)) {
    if (profile.disabilityStatus && !/none|no|n\/a/i.test(profile.disabilityStatus)) {
      score += 20;
      reasons.push("Disability status on profile supports Saksham-type scholarships");
    } else {
      score -= 18;
      reasons.push("Saksham requires benchmark disability — update profile if applicable");
    }
  }

  // Age heuristics
  if (profile.age) {
    if (opp.category === "Internship" && profile.age <= 25) {
      score += 6;
      reasons.push(`Age ${profile.age} fits typical internship age windows`);
    }
    if (/sukanya|apy|pension/i.test(opp.id) && profile.age > 40) {
      score += 4;
    }
  }

  // Skills boost for internships / hackathons
  if (["Internship", "Hackathon", "Skill Development"].includes(opp.category) && profile.skills.length) {
    score += Math.min(8, profile.skills.length);
    reasons.push(`Your skills (${profile.skills.slice(0, 3).join(", ")}) strengthen internship/hackathon competitiveness`);
  }

  score = Math.max(12, Math.min(98, Math.round(score)));

  let eligibilityStatus: EligibilityStatus;
  if (score >= 78) eligibilityStatus = "Eligible";
  else if (score >= 52) eligibilityStatus = "Likely Eligible";
  else eligibilityStatus = "Not Eligible";

  if (reasons.length === 0) {
    reasons.push("Complete your profile for a more precise eligibility assessment");
  }
  reasons.push("Always verify final eligibility on the official portal before applying");

  return { matchScore: score, eligibilityStatus, eligibilityReasons: reasons };
}

export function enrichOpportunity(
  opp: Opportunity,
  profile: UserProfile
): Opportunity {
  const result = computeEligibility(opp, profile);
  return { ...opp, ...result };
}

export function enrichOpportunities(
  schemes: Opportunity[],
  profile: UserProfile
): Opportunity[] {
  return schemes
    .map((s) => enrichOpportunity(s, profile))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

"use client";

import {
  Search,
  CheckCircle2,
  FileText,
  Map,
  Calendar,
  FolderLock,
  ListChecks,
  MessageSquare,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { FadeIn } from "@/components/shared/ui-helpers";
import { cn } from "@/lib/utils";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Search,
    title: "Opportunity Discovery",
    description:
      "AI scans verified government portals and surfaces scholarships, grants, internships, and welfare schemes matched to your profile.",
  },
  {
    icon: CheckCircle2,
    title: "Eligibility Checker",
    description:
      "Instant eligibility verdicts with clear reasoning — know whether you qualify before investing time in an application.",
  },
  {
    icon: FileText,
    title: "Document Explainer",
    description:
      "Upload dense government PDFs and get plain-language summaries of requirements, deadlines, and key clauses.",
  },
  {
    icon: Map,
    title: "Application Roadmap",
    description:
      "Step-by-step checklists tailored to each opportunity, so you never miss a form field or verification step.",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description:
      "Deadline tracking with smart reminders — stay ahead of closing dates across all your active applications.",
  },
  {
    icon: FolderLock,
    title: "Document Vault",
    description:
      "Securely store Aadhaar, mark sheets, income certificates, and more — reuse documents across applications.",
  },
  {
    icon: ListChecks,
    title: "Tracker",
    description:
      "Monitor every application from draft to decision with status updates and next-step guidance.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description:
      "Ask questions about schemes, documents, or processes and get accurate answers grounded in official sources.",
  },
  {
    icon: GraduationCap,
    title: "Career Advisor",
    description:
      "Personalized recommendations for skills, courses, and opportunities that strengthen your long-term eligibility.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-y border-indigo-100/70 bg-gradient-to-b from-indigo-50/30 via-white/40 to-indigo-50/20 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to navigate government opportunities
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            One platform to discover, understand, prepare, and track — powered by
            AI that speaks your language.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.05}>
              <div
                className={cn(
                  "group h-full rounded-2xl border border-indigo-100/80 bg-white/75 p-6 shadow-sm shadow-indigo-500/[0.03] backdrop-blur-xl",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10"
                )}
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100/70 shadow-2xs transition-all duration-300 group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/25">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

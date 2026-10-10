"use client";

import { UserCircle, Sparkles, ShieldCheck, Send } from "lucide-react";
import { FadeIn } from "@/components/shared/ui-helpers";

const STEPS = [
  {
    step: "01",
    icon: UserCircle,
    title: "Create your profile",
    description:
      "Tell us about your education, income, location, and interests. EduSaathi builds a secure profile that powers personalized matching.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI discovers matches",
    description:
      "Our engine scans thousands of verified government opportunities and surfaces the ones most relevant to your background and goals.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Understand & check eligibility",
    description:
      "Get plain-language explanations of complex criteria, document requirements, and an eligibility verdict with clear reasoning.",
  },
  {
    step: "04",
    icon: Send,
    title: "Apply with guidance",
    description:
      "Follow step-by-step roadmaps, deadline reminders, and AI assistance through every stage of your application.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From profile to application in four steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            EduSaathi removes the guesswork from navigating government
            opportunities — so you can focus on what matters.
          </p>
        </FadeIn>

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-indigo-200 via-blue-200 to-violet-200 lg:block" />

          {STEPS.map((item, index) => (
            <FadeIn key={item.step} delay={index * 0.08}>
              <div className="relative flex flex-col">
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-indigo-100/80 bg-white shadow-md shadow-indigo-500/10">
                    <item.icon className="size-5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-indigo-600">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

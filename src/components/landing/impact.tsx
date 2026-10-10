"use client";

import { IMPACT_STATS } from "@/lib/mock-data";
import { FadeIn } from "@/components/shared/ui-helpers";

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Impact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trusted by citizens across India
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            EduSaathi connects students and citizens to the opportunities they deserve — faster,
            with clarity and confidence.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT_STATS.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 0.08}>
              <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-sm shadow-slate-900/[0.03]">
                <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

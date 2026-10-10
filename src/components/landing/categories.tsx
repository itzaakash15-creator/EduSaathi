"use client";

import {
  GraduationCap,
  Briefcase,
  FlaskConical,
  Code2,
  Rocket,
  Heart,
  Wheat,
  Stethoscope,
  Home,
  BookOpen,
  HandHeart,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { FadeIn } from "@/components/shared/ui-helpers";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Briefcase,
  FlaskConical,
  Code2,
  Rocket,
  Heart,
  Wheat,
  Stethoscope,
  Home,
  BookOpen,
  HandHeart,
  Wrench,
};

export function Categories() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Categories</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Opportunities across every sector
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From scholarships to startup grants, healthcare to housing — explore
            verified schemes indexed by category.
          </p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => {
            const Icon = ICON_MAP[category.icon] ?? BookOpen;
            return (
              <FadeIn key={category.name} delay={index * 0.04}>
                <div className="group flex flex-col items-center rounded-2xl border border-border bg-card px-4 py-6 text-center shadow-sm shadow-slate-900/[0.03] transition-colors hover:border-primary/20 hover:bg-accent/50">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold tracking-tight">
                    {category.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.count.toLocaleString()} indexed
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/mock-data";
import { FadeIn } from "@/components/shared/ui-helpers";

export function Testimonials() {
  return (
    <section className="border-y border-border bg-card/50 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Testimonials</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Real stories from real citizens
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how EduSaathi is helping students, entrepreneurs, and families
            access government opportunities.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <FadeIn key={testimonial.name} delay={index * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm shadow-slate-900/[0.03]">
                <Quote className="size-8 text-primary/20" aria-hidden />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

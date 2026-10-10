"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { FadeIn } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="gradient-mesh pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-indigo-900 shadow-2xs">
              <span className="flex size-2 rounded-full bg-indigo-600 shadow-xs" />
              AI-powered government opportunity discovery
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              Find Every Government Opportunity{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                You&apos;re Eligible For.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              EduSaathi AI scans verified government portals, explains complex
              eligibility criteria in plain language, and guides you from discovery
              to application — so you never miss a scholarship, grant, or welfare
              scheme again.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-11.5 gap-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 px-7 text-[15px] font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-102 hover:shadow-lg hover:shadow-indigo-500/30"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11.5 gap-2 rounded-xl border-indigo-200/80 bg-white/80 px-6 text-[15px] font-medium text-slate-700 shadow-2xs backdrop-blur-md hover:bg-white hover:border-indigo-400"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                <Play className="size-3.5 fill-current text-indigo-600" />
                Demo Login
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-8 text-sm text-muted-foreground">
              Free for citizens · Verified official sources · No credit card required
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.1} className="relative hidden lg:block">
          <HeroVisual />
        </FadeIn>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square max-h-[520px] w-full">
      <motion.div
        className="absolute inset-8 rounded-3xl border border-border/80 bg-card shadow-xl shadow-slate-900/[0.06]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 rounded-3xl opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          className="absolute left-10 top-12 h-24 w-24 rounded-2xl border border-primary/20 bg-primary/5"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-14 top-20 h-16 w-16 rotate-12 rounded-xl border border-border bg-muted"
          animate={{ y: [0, 8, 0], rotate: [12, 18, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-24 left-16 h-20 w-32 rounded-2xl border border-border bg-card shadow-sm"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="flex h-full flex-col justify-center gap-2 px-4">
            <div className="h-2 w-16 rounded-full bg-primary/30" />
            <div className="h-2 w-24 rounded-full bg-muted-foreground/20" />
            <div className="h-2 w-20 rounded-full bg-muted-foreground/15" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-16 right-12 flex size-28 items-center justify-center rounded-full border border-primary/15 bg-primary/[0.04]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 14c3-6 6-9 8-9s5 3 8 9" strokeLinecap="round" />
              <path d="M7 14h10" strokeLinecap="round" />
              <circle cx="12" cy="17" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-px w-40 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-40 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </motion.div>

      <motion.div
        className="absolute -right-2 top-6 rounded-xl border border-border bg-card px-4 py-3 shadow-lg shadow-slate-900/5"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="text-xs font-medium text-muted-foreground">Match score</p>
        <p className="text-2xl font-semibold tracking-tight text-primary">94%</p>
      </motion.div>

      <motion.div
        className="absolute -left-2 bottom-10 rounded-xl border border-border bg-card px-4 py-3 shadow-lg shadow-slate-900/5"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <p className="text-xs font-medium text-muted-foreground">Eligible schemes</p>
        <p className="text-2xl font-semibold tracking-tight">12 found</p>
      </motion.div>
    </div>
  );
}

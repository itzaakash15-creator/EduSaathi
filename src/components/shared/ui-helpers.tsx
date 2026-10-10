"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/70 p-5 shadow-sm shadow-indigo-500/[0.04] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300/80 hover:bg-white/90 hover:shadow-md hover:shadow-indigo-500/10">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100/60 shadow-xs transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            {icon}
          </div>
        )}
      </div>
      <p className="relative mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {(subtitle || trend) && (
        <p className="relative mt-1 text-xs text-slate-500">
          {trend && <span className="font-semibold text-emerald-600">{trend} </span>}
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200/70 bg-white/50 px-6 py-16 text-center backdrop-blur-md">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

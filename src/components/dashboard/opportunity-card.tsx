"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { BadgeCheck, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EligibilityStatus, Opportunity } from "@/lib/types";

export function EligibilityBadge({
  status,
  className,
}: {
  status?: EligibilityStatus;
  className?: string;
}) {
  if (!status) return null;

  const styles: Record<EligibilityStatus, string> = {
    Eligible: "border-success/30 bg-success/10 text-success",
    "Likely Eligible": "border-warning/30 bg-warning/10 text-warning",
    "Not Eligible": "border-destructive/30 bg-destructive/10 text-destructive",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", styles[status], className)}
    >
      {status}
    </Badge>
  );
}

export function OpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const deadline = format(parseISO(opportunity.deadline), "d MMM yyyy");

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="group relative block rounded-2xl border border-indigo-100/80 bg-white/75 p-5 shadow-sm shadow-indigo-500/[0.03] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white/95 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="border border-indigo-100/70 bg-indigo-50/70 text-[10px] font-medium text-indigo-700">
              {opportunity.category}
            </Badge>
            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <h3
            className={cn(
              "font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600",
              compact ? "text-sm line-clamp-2" : "text-base"
            )}
          >
            {opportunity.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {opportunity.organization}
          </p>
        </div>
        <EligibilityBadge status={opportunity.eligibilityStatus} />
      </div>

      {!compact && (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {opportunity.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-indigo-500/80" />
          {deadline}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-indigo-500/80" />
          {opportunity.location}
        </span>
        {opportunity.amount && (
          <span className="font-semibold text-slate-900">{opportunity.amount}</span>
        )}
      </div>

      {opportunity.matchScore != null && (
        <div className="mt-4 pt-2 border-t border-indigo-50">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Match score</span>
            <span className="font-bold text-indigo-600">{opportunity.matchScore}%</span>
          </div>
          <Progress value={opportunity.matchScore} className="h-1.5 bg-indigo-100/60" />
        </div>
      )}
    </Link>
  );
}

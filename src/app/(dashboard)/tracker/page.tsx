"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserApplications, updateApplicationStatus as syncStatusToFirestore } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Draft: "border-slate-200 bg-slate-100/70 text-slate-700",
  Submitted: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "Under Review": "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function TrackerPage() {
  const { user, isDemo } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (!uid) return;
    getUserApplications(uid, isDemo).then(setApplications).catch(() => {});
  }, [user, isDemo]);


  const filtered =
    filter === "All"
      ? applications
      : applications.filter((a) => a.status === filter);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, updatedAt: new Date().toISOString() }
          : a
      )
    );
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (uid) {
      await syncStatusToFirestore(uid, id, status, undefined, isDemo);
      toast.success(`Application status updated to ${status}`);
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Application Tracker"
          description="Monitor every application from draft to decision. Update status and track next steps."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs value={filter} onValueChange={(v) => v && setFilter(String(v))}>
          <TabsList className="h-auto flex-wrap gap-1.5 bg-transparent p-0">
            <TabsTrigger
              value="All"
              className="rounded-full border border-indigo-100/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white data-active:border-indigo-600 data-active:bg-gradient-to-tr data-active:from-indigo-600 data-active:to-blue-600 data-active:text-white"
            >
              All ({applications.length})
            </TabsTrigger>
            {STATUSES.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="rounded-full border border-indigo-100/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white data-active:border-indigo-600 data-active:bg-gradient-to-tr data-active:from-indigo-600 data-active:to-blue-600 data-active:text-white"
              >
                {s} ({applications.filter((a) => a.status === s).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeIn>

      <div className="space-y-4">
        {filtered.map((app, i) => (
          <FadeIn key={app.id} delay={0.05 + i * 0.03}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md hover:shadow-indigo-500/10">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-medium", STATUS_STYLES[app.status])}
                      >
                        {app.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Updated {format(parseISO(app.updatedAt), "d MMM yyyy")}
                      </span>
                    </div>
                    <Link
                      href={`/opportunities/${app.opportunityId}`}
                      className="text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600"
                    >
                      {app.opportunityTitle}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {app.organization}
                    </p>
                    {app.submittedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Submitted {format(parseISO(app.submittedAt), "d MMM yyyy")}
                      </p>
                    )}
                  </div>
                  <Select
                    value={app.status}
                    onValueChange={(v) =>
                      v && updateStatus(app.id, v as ApplicationStatus)
                    }
                  >
                    <SelectTrigger className="h-9.5 w-40 rounded-xl border-indigo-100/80 bg-white/80 shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(app.notes || app.nextStep) && (
                  <div className="mt-4 grid gap-3 border-t border-indigo-50 pt-4 sm:grid-cols-2">
                    {app.notes && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Notes
                        </p>
                        <p className="text-sm text-slate-700">{app.notes}</p>
                      </div>
                    )}
                    {app.nextStep && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                          Next step
                        </p>
                        <p className="text-sm font-semibold text-indigo-700">
                          {app.nextStep}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-indigo-200/80 bg-white/50 py-16 text-center backdrop-blur-md">
          <p className="text-sm text-slate-500">
            No applications with status &ldquo;{filter}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

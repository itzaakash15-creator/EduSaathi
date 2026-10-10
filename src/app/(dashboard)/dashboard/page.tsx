"use client";

import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Target,
  FileCheck2,
  CalendarClock,
  Bookmark,
  Upload,
  Search,
  ListChecks,
  ArrowRight,
  Bell,
} from "lucide-react";
import { PageHeader, FadeIn, StatCard } from "@/components/shared/ui-helpers";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { getRecommended } from "@/lib/api";
import {
  OPPORTUNITIES,
  APPLICATIONS,
  NOTIFICATIONS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    href: "/document-explainer",
    label: "Upload Government PDF",
    description: "Explain a notification in plain language",
    icon: Upload,
  },
  {
    href: "/eligibility",
    label: "Check Eligibility",
    description: "See if you qualify for a scheme",
    icon: FileCheck2,
  },
  {
    href: "/search",
    label: "Search Opportunities",
    description: "Natural language discovery",
    icon: Search,
  },
  {
    href: "/tracker",
    label: "Application Tracker",
    description: "Monitor your submissions",
    icon: ListChecks,
  },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const recommendations = getRecommended(profile).slice(0, 4);

  const eligibleCount = OPPORTUNITIES.filter(
    (o) =>
      o.eligibilityStatus === "Eligible" ||
      o.eligibilityStatus === "Likely Eligible"
  ).length;

  const submittedCount = APPLICATIONS.filter(
    (a) => a.status !== "Draft"
  ).length;

  const today = new Date();
  const upcomingDeadlines = [...OPPORTUNITIES]
    .filter((o) => differenceInDays(parseISO(o.deadline), today) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  const deadlineCount = OPPORTUNITIES.filter((o) => {
    const days = differenceInDays(parseISO(o.deadline), today);
    return days >= 0 && days <= 30;
  }).length;

  const savedCount = 3;
  const recentNotifications = NOTIFICATIONS.slice(0, 4);
  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title={`Good evening, ${firstName}`}
          description="Here is your personalized overview of opportunities, deadlines, and next steps."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Eligible Opportunities"
            value={eligibleCount}
            subtitle="Based on your profile"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            title="Applications Submitted"
            value={submittedCount}
            subtitle={`${APPLICATIONS.length} total tracked`}
            icon={<FileCheck2 className="h-4 w-4" />}
          />
          <StatCard
            title="Upcoming Deadlines"
            value={deadlineCount}
            subtitle="Within the next 30 days"
            icon={<CalendarClock className="h-4 w-4" />}
          />
          <StatCard
            title="Saved Opportunities"
            value={savedCount}
            subtitle="Bookmarked for later"
            icon={<Bookmark className="h-4 w-4" />}
          />
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest Recommendations</h2>
            <Link
              href="/opportunities"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1"
              )}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} compact />
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="space-y-2.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-2xl border border-indigo-100/80 bg-white/75 p-3.5 shadow-sm shadow-indigo-500/[0.02] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md hover:shadow-indigo-500/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100/60 shadow-xs transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{action.label}</p>
                    <p className="text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                </Link>
              );
            })}
          </div>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.2}>
          <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Upcoming Deadlines
              </CardTitle>
              <Link
                href="/calendar"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700")}
              >
                Calendar
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingDeadlines.map((opp) => {
                const days = differenceInDays(parseISO(opp.deadline), today);
                return (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="flex items-center justify-between rounded-xl border border-indigo-50 bg-white/60 px-3.5 py-2.5 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-sm font-semibold text-slate-800">{opp.title}</p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(opp.deadline), "d MMM yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        days <= 7
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : days <= 14
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-indigo-100 bg-indigo-50/50 text-indigo-700"
                      )}
                    >
                      {days === 0 ? "Today" : `${days}d left`}
                    </Badge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Recent Notifications
              </CardTitle>
              <Link
                href="/notifications"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700")}
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentNotifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href || "/notifications"}
                  className={cn(
                    "flex gap-3 rounded-xl border px-3.5 py-2.5 transition-all hover:bg-white hover:shadow-xs",
                    !n.read ? "border-indigo-200/80 bg-indigo-50/40" : "border-indigo-50 bg-white/60"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100/60 text-indigo-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

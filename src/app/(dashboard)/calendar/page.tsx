"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  format,
  parseISO,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { CalendarDays, ExternalLink } from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { getRecommended } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { profile } = useAuth();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const schemes = useMemo(() => getRecommended(profile), [profile]);

  const deadlineDates = useMemo(
    () => schemes.map((o) => parseISO(o.deadline)),
    [schemes]
  );

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return schemes
      .filter((o) => !isBefore(parseISO(o.deadline), today))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [schemes]);

  const deadlinesForSelected = useMemo(() => {
    if (!selected) return [];
    return schemes.filter((o) => isSameDay(parseISO(o.deadline), selected));
  }, [selected, schemes]);

  const deadlinesForMonth = useMemo(() => {
    return schemes
      .filter((o) => isSameMonth(parseISO(o.deadline), month))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [month, schemes]);

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Deadline Calendar"
          description={`Real scheme deadlines from ${schemes.length} verified government opportunities. Days with deadlines are marked.`}
        />
      </FadeIn>

      <FadeIn delay={0.03}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="rounded-xl border-border">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Upcoming deadlines</p>
              <p className="text-2xl font-semibold">{upcoming.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">This month</p>
              <p className="text-2xl font-semibold">{deadlinesForMonth.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Next deadline</p>
              <p className="text-sm font-semibold leading-tight pt-1">
                {upcoming[0]
                  ? `${upcoming[0].title.slice(0, 42)}${upcoming[0].title.length > 42 ? "…" : ""} · ${format(parseISO(upcoming[0].deadline), "d MMM")}`
                  : "None scheduled"}
              </p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.05}>
          <Card className="rounded-2xl border-border">
            <CardContent className="flex justify-center p-4">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                month={month}
                onMonthChange={setMonth}
                modifiers={{
                  deadline: deadlineDates,
                }}
                modifiersClassNames={{
                  deadline:
                    "relative font-semibold text-primary after:absolute after:bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                }}
                className="rounded-xl"
              />
            </CardContent>
          </Card>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {selected
                    ? format(selected, "d MMMM yyyy")
                    : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deadlinesForSelected.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No scheme deadlines on this date. Select a highlighted day.
                  </p>
                ) : (
                  deadlinesForSelected.map((opp) => (
                    <div
                      key={opp.id}
                      className="rounded-lg border border-border/60 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="truncate text-sm font-medium hover:text-primary"
                          >
                            {opp.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {opp.organization}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {opp.description}
                          </p>
                        </div>
                        <Badge variant="outline">{opp.amount || opp.category}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{opp.category}</Badge>
                        {opp.eligibilityStatus && (
                          <Badge variant="outline">{opp.eligibilityStatus}</Badge>
                        )}
                        {opp.matchScore != null && (
                          <span className="text-xs text-muted-foreground">
                            {opp.matchScore}% match
                          </span>
                        )}
                        <a
                          href={opp.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Official portal <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  {format(month, "MMMM yyyy")} deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[360px] space-y-2 overflow-y-auto">
                {deadlinesForMonth.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No deadlines this month — try the next month.
                  </p>
                ) : (
                  deadlinesForMonth.map((opp) => {
                    const date = parseISO(opp.deadline);
                    const isSelected = selected && isSameDay(date, selected);
                    const daysLeft = differenceInCalendarDays(
                      date,
                      startOfDay(new Date())
                    );
                    return (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => setSelected(date)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                          isSelected
                            ? "border-primary/30 bg-primary/[0.03]"
                            : "border-border/60"
                        )}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="truncate text-sm font-medium">
                            {opp.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(date, "d MMM yyyy")}
                            {daysLeft >= 0
                              ? ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                              : " · passed"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            opp.eligibilityStatus === "Eligible" &&
                              "border-success/30 text-success"
                          )}
                        >
                          {opp.eligibilityStatus || opp.category}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

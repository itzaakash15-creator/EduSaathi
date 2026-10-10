"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Route, Loader2, Clock, FileText, Lightbulb, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { generateRoadmap, getOpportunity } from "@/lib/api";
import { REAL_SCHEMES } from "@/lib/schemes-data";
import type { ApplicationRoadmap } from "@/lib/types";

function RoadmapContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [selectedId, setSelectedId] = useState(
    searchParams.get("id") || REAL_SCHEMES[0].id
  );
  const [roadmap, setRoadmap] = useState<ApplicationRoadmap | null>(null);
  const [aiSource, setAiSource] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedId(id);
  }, [searchParams]);

  useEffect(() => {
    // Instant local roadmap from real scheme steps — no waiting on Gemini
    startTransition(() => {
      generateRoadmap(selectedId, profile, { preferAi: false }).then((data) => {
        setRoadmap(data);
        setAiSource(false);
      });
    });
  }, [selectedId, profile]);

  const opportunity = getOpportunity(selectedId, profile);

  const refineWithAi = async () => {
    setAiLoading(true);
    try {
      const data = await generateRoadmap(selectedId, profile, { preferAi: true });
      setRoadmap(data);
      setAiSource(true);
      toast.success("Roadmap refined with Gemini");
    } catch {
      toast.error("AI refine timed out — showing official portal steps");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Application Roadmap"
          description="Steps built from the scheme’s official process, documents, and portal. Optionally refine with AI."
          action={
            <Button
              variant="outline"
              className="gap-2"
              onClick={refineWithAi}
              disabled={aiLoading || isPending}
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {aiLoading ? "Refining…" : "Refine with AI"}
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="max-w-xl space-y-2">
          <label className="text-sm font-medium">Select opportunity</label>
          <Select value={selectedId} onValueChange={(v) => v && setSelectedId(String(v))}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Choose an opportunity" />
            </SelectTrigger>
            <SelectContent>
              {REAL_SCHEMES.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {opportunity?.officialUrl && (
            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Official portal <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {aiSource && (
            <p className="text-xs text-muted-foreground">Showing Gemini-refined plan</p>
          )}
        </div>
      </FadeIn>

      {!roadmap || isPending ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border-primary/20 bg-primary/[0.03]">
              <CardContent className="flex flex-wrap items-center gap-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Route className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roadmap for</p>
                    <p className="font-semibold">{roadmap.opportunityTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    <span className="font-semibold">{roadmap.totalDays} days</span>{" "}
                    estimated total
                  </span>
                </div>
                {opportunity?.deadline && (
                  <Badge variant="secondary">Deadline {opportunity.deadline}</Badge>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <div className="relative space-y-0">
            {roadmap.steps.map((step, i) => (
              <FadeIn key={`${step.title}-${i}`} delay={0.05 + i * 0.03}>
                <div className="relative flex gap-6 pb-8">
                  {i < roadmap.steps.length - 1 && (
                    <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-border" />
                  )}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <Card className="flex-1 rounded-2xl border-border">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedDays} day{step.estimatedDays !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Documents needed
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.documents.map((d) => (
                            <Badge key={d} variant="outline" className="text-[10px]">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Tips
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {step.tips.map((t) => (
                            <li key={t} className="flex gap-2">
                              <span className="text-primary">→</span>
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <Card className="rounded-2xl border-success/20 bg-success/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-success">
                  Success tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {roadmap.successTips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-success">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}

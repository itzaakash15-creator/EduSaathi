"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  User,
  Sparkles,
  Bot,
} from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { EligibilityBadge } from "@/components/dashboard/opportunity-card";
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
import { getOpportunity, chatWithAssistant } from "@/lib/api";
import { REAL_SCHEMES } from "@/lib/schemes-data";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types";

function StatusVisual({ status }: { status?: EligibilityStatus }) {
  const config = {
    Eligible: {
      icon: CheckCircle2,
      ring: "ring-success/30",
      bg: "bg-success/10",
      text: "text-success",
    },
    "Likely Eligible": {
      icon: AlertTriangle,
      ring: "ring-warning/30",
      bg: "bg-warning/10",
      text: "text-warning",
    },
    "Not Eligible": {
      icon: XCircle,
      ring: "ring-destructive/30",
      bg: "bg-destructive/10",
      text: "text-destructive",
    },
  };

  const key = status || "Not Eligible";
  const { icon: Icon, ring, bg, text } = config[key];

  return (
    <div
      className={cn(
        "mx-auto flex h-24 w-24 items-center justify-center rounded-full ring-4",
        ring,
        bg
      )}
    >
      <Icon className={cn("h-12 w-12", text)} />
    </div>
  );
}

function EligibilityContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [selectedId, setSelectedId] = useState(
    searchParams.get("opportunity") || REAL_SCHEMES[0].id
  );
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const opp = searchParams.get("opportunity");
    if (opp) setSelectedId(opp);
  }, [searchParams]);

  // Reset analysis on scheme change
  useEffect(() => {
    setAiAnalysis(null);
  }, [selectedId]);

  const opportunity = getOpportunity(selectedId, profile);

  const handleAiAssessment = async () => {
    if (!opportunity || aiLoading) return;
    setAiLoading(true);
    try {
      const prompt = `Perform an in-depth eligibility assessment for student ${profile?.name || "Aakash K"} (${profile?.education || "B.Tech CS"}, ${profile?.state || "Tamil Nadu"}, income ${profile?.income || "<8 LPA"}) applying for "${opportunity.title}" (${opportunity.organization}). Break down:
1. Exact Eligibility Verdict & Match Justification
2. Mandatory Documents Checklist
3. Critical Mistakes to Avoid on the official portal (${opportunity.officialUrl || "portal"}).`;
      const reply = await chatWithAssistant([{ role: "user", content: prompt }], profile);
      setAiAnalysis(reply);
    } catch {
      setAiAnalysis("⚠️ Unable to connect to Gemini AI. Please ensure backend is running.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Eligibility Checker"
          description="See how your profile matches official scheme criteria. Results are advisory — always confirm on the official portal."
          action={
            <Button
              onClick={handleAiAssessment}
              disabled={aiLoading}
              className="gap-2 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-600"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {aiLoading ? "Gemini Assessing…" : "AI Deep Assessment"}
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="max-w-xl space-y-2">
          <label className="text-sm font-semibold text-slate-800">Select opportunity</label>
          <Select value={selectedId} onValueChange={(v) => v && setSelectedId(String(v))}>
            <SelectTrigger className="h-10.5 w-full rounded-xl border-indigo-100/80 bg-white/80 shadow-2xs backdrop-blur-md">
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
        </div>
      </FadeIn>

      {aiAnalysis && (
        <FadeIn delay={0.08}>
          <Card className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-6 backdrop-blur-xl shadow-md shadow-indigo-500/5">
            <div className="flex items-center gap-2.5 text-indigo-700 font-bold mb-3">
              <Bot className="h-5 w-5" />
              <span>EduSaathi Gemini AI Live Assessment</span>
            </div>
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-sm">
              {aiAnalysis}
            </div>
          </Card>
        </FadeIn>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
            <CardHeader className="text-center">
              <StatusVisual status={opportunity.eligibilityStatus} />
              <div className="mt-4 flex flex-col items-center gap-2">
                <EligibilityBadge status={opportunity.eligibilityStatus} />
                <CardTitle className="text-xl font-bold text-slate-900">{opportunity.title}</CardTitle>
                <p className="text-sm text-slate-500">
                  {opportunity.organization}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="mb-3 text-sm font-bold text-slate-800">Why this result?</h3>
              <ul className="space-y-2.5">
                {opportunity.eligibilityReasons?.map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-3 rounded-xl border border-indigo-50 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-2xs"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600 shadow-xs" />
                    {reason}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>


        <FadeIn delay={0.15}>
          <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base font-semibold text-slate-900">Profile used for check</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</span>
                <p className="font-semibold text-slate-900">{profile?.name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Education</span>
                <p className="font-medium text-slate-800">{profile?.education}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Occupation</span>
                <p className="font-medium text-slate-800">{profile?.occupation}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Income</span>
                <p className="font-medium text-slate-800">{profile?.income}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">State</span>
                <p className="font-medium text-slate-800">{profile?.state}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile?.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="border border-indigo-100/70 bg-indigo-50/70 text-[10px] font-medium text-indigo-700">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

export default function EligibilityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EligibilityContent />
    </Suspense>
  );
}

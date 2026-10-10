"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  Route,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { EligibilityBadge } from "@/components/dashboard/opportunity-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/auth-context";
import { getOpportunity } from "@/lib/api";
import { getUserBookmarks, toggleBookmark } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types";

function StatusIcon({ status }: { status?: EligibilityStatus }) {
  if (status === "Eligible")
    return <CheckCircle2 className="h-5 w-5 text-success" />;
  if (status === "Likely Eligible")
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const { user, profile, isDemo } = useAuth();
  const id = params.id as string;
  const opportunity = getOpportunity(id, profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (!uid || !id) return;
    getUserBookmarks(uid, isDemo).then((bookmarks) => {
      setSaved(bookmarks.includes(id));
    }).catch(() => {});
  }, [user, id, isDemo]);

  if (!opportunity) {
    return (
      <div className="space-y-4 text-center py-16">
        <h1 className="text-xl font-semibold">Opportunity not found</h1>
        <Link href="/opportunities" className={buttonVariants()}>
          Back to opportunities
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (!uid) {
      toast.info("Sign in to save opportunities to your vault");
      return;
    }
    const newSaved = await toggleBookmark(uid, opportunity.id, isDemo);
    setSaved(newSaved);
    if (newSaved) {
      toast.success("Opportunity saved to your bookmarks");
    } else {
      toast.info("Opportunity removed from bookmarks");
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <Link
          href="/opportunities"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 -ml-2 gap-1"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          All opportunities
        </Link>
        <PageHeader
          title={opportunity.title}
          description={opportunity.organization}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/roadmap?id=${opportunity.id}`}
                className={buttonVariants({ className: "gap-2" })}
              >
                <Route className="h-4 w-4" />
                Generate Roadmap
              </Link>
              <Link
                href={`/eligibility?opportunity=${opportunity.id}`}
                className={buttonVariants({ variant: "outline", className: "gap-2" })}
              >
                <FileCheck2 className="h-4 w-4" />
                Check Eligibility
              </Link>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSave}
                disabled={saved}
              >
                <Bookmark className="h-4 w-4" />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          }
        />
      </FadeIn>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{opportunity.category}</Badge>
        {opportunity.verified && (
          <Badge variant="outline" className="border-success/30 text-success">
            Verified source
          </Badge>
        )}
        {opportunity.amount && <Badge variant="outline">{opportunity.amount}</Badge>}
        <Badge variant="outline">
          Deadline: {format(parseISO(opportunity.deadline), "d MMM yyyy")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FadeIn delay={0.05}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-base">About this opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{opportunity.description}</p>
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Benefits</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {opportunity.benefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Eligibility criteria</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {opportunity.eligibility.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Required documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.documents.map((d) => (
                      <Badge key={d} variant="secondary">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {opportunity.applicationSteps && (
            <FadeIn delay={0.1}>
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-base">Application steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {opportunity.applicationSteps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {opportunity.commonMistakes && opportunity.commonMistakes.length > 0 && (
            <FadeIn delay={0.15}>
              <Card className="rounded-2xl border-destructive/20 bg-destructive/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Common mistakes to avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {opportunity.commonMistakes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {opportunity.faqs && opportunity.faqs.length > 0 && (
            <FadeIn delay={0.2}>
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-base">Frequently asked questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion>
                    {opportunity.faqs.map((faq, i) => (
                      <AccordionItem key={faq.question} value={`faq-${i}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>

        <div className="space-y-6">
          <FadeIn delay={0.05}>
            <Card
              className={cn(
                "rounded-2xl border-2",
                opportunity.eligibilityStatus === "Eligible"
                  ? "border-success/30 bg-success/[0.03]"
                  : opportunity.eligibilityStatus === "Likely Eligible"
                    ? "border-warning/30 bg-warning/[0.03]"
                    : "border-destructive/30 bg-destructive/[0.03]"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StatusIcon status={opportunity.eligibilityStatus} />
                  <CardTitle className="text-base">Your eligibility</CardTitle>
                </div>
                <EligibilityBadge status={opportunity.eligibilityStatus} />
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {opportunity.eligibilityReasons?.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{opportunity.location}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium">
                    {format(parseISO(opportunity.publishedAt), "d MMM yyyy")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match score</span>
                  <span className="font-semibold text-primary">
                    {opportunity.matchScore}%
                  </span>
                </div>
                <Separator />
                <a
                  href={opportunity.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", className: "w-full gap-2" })
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  Official portal
                </a>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

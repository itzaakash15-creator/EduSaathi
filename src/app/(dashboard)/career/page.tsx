"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  FolderGit2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { getCareerAdvice } from "@/lib/api";
import type { CareerAdvice } from "@/lib/types";

export default function CareerPage() {
  const { profile } = useAuth();
  const [advice, setAdvice] = useState<CareerAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCareerAdvice(profile).then((data) => {
      setAdvice(data);
      setLoading(false);
    });
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Career Advisor"
          description="Personalized skills, certifications, and projects to strengthen your eligibility for scholarships, internships, and grants."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="rounded-2xl border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex items-start gap-4 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Eligibility impact</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {advice.eligibilityImpact}
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Recommended skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {advice.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {advice.certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {cert}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Recommended courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {advice.courses.map((course) => (
              <div
                key={course.title}
                className="rounded-xl border border-border/60 p-4"
              >
                <p className="font-medium">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.provider}</p>
                <p className="mt-2 text-sm text-muted-foreground">{course.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderGit2 className="h-4 w-4 text-primary" />
              Suggested projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {advice.projects.map((project, i) => (
                <li
                  key={project}
                  className="flex gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm text-muted-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {project}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, FileBarChart } from "lucide-react";
import { jsPDF } from "jspdf";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { EligibilityBadge } from "@/components/dashboard/opportunity-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { getRecommended } from "@/lib/api";
import { getUserApplications } from "@/lib/db";
import type { Application } from "@/lib/types";


export default function ReportsPage() {
  const { profile, user, isDemo } = useAuth();
  const [userApplications, setUserApplications] = useState<Application[]>([]);

  useEffect(() => {
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (!uid) return;
    getUserApplications(uid, isDemo).then(setUserApplications).catch(() => {});
  }, [user, isDemo]);

  const recommendations = getRecommended(profile);
  const eligible = recommendations.filter(
    (o) =>
      o.eligibilityStatus === "Eligible" ||
      o.eligibilityStatus === "Likely Eligible"
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(18);
    doc.text("EduSaathi Eligibility Report", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), "d MMM yyyy, h:mm a")}`, margin, y);
    y += 12;

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("Profile Summary", margin, y);
    y += 7;
    doc.setFontSize(10);
    const profileLines = [
      `Name: ${profile?.name || "N/A"}`,
      `Education: ${profile?.education || "N/A"}`,
      `Occupation: ${profile?.occupation || "N/A"}`,
      `Income: ${profile?.income || "N/A"}`,
      `State: ${profile?.state || "N/A"}`,
    ];
    profileLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 6;
    });
    y += 6;

    doc.setFontSize(12);
    doc.text(`Eligible Opportunities (${eligible.length})`, margin, y);
    y += 8;
    doc.setFontSize(9);

    eligible.slice(0, 8).forEach((opp) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      const title =
        opp.title.length > 70 ? opp.title.slice(0, 67) + "..." : opp.title;
      doc.text(title, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(
        `${opp.eligibilityStatus} | Match: ${opp.matchScore}% | Deadline: ${opp.deadline}`,
        margin,
        y
      );
      y += 8;
    });

    y += 4;
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(12);
    doc.text(`Applications Tracked (${userApplications.length})`, margin, y);
    y += 8;
    doc.setFontSize(9);
    if (userApplications.length === 0) {
      doc.text("No active applications currently tracked.", margin, y);
      y += 6;
    } else {
      userApplications.forEach((app) => {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.text(`${app.opportunityTitle} — ${app.status}`, margin, y);
        y += 6;
      });
    }


    doc.save(`edusaathi-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Reports"
          description="Generate a downloadable PDF summary of your eligibility profile and tracked opportunities."
          action={
            <Button className="gap-2" onClick={generatePDF}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileBarChart className="h-4 w-4 text-primary" />
              Report preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Profile summary</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {profile?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Education:</span>{" "}
                  {profile?.education}
                </p>
                <p>
                  <span className="text-muted-foreground">Occupation:</span>{" "}
                  {profile?.occupation}
                </p>
                <p>
                  <span className="text-muted-foreground">Income:</span>{" "}
                  {profile?.income}
                </p>
                <p>
                  <span className="text-muted-foreground">State:</span>{" "}
                  {profile?.state}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Eligible opportunities ({eligible.length})
              </h3>
              <div className="space-y-3">
                {eligible.slice(0, 6).map((opp) => (
                  <div
                    key={opp.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{opp.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {opp.deadline} · Match: {opp.matchScore}%
                      </p>
                    </div>
                    <EligibilityBadge status={opp.eligibilityStatus} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Applications ({userApplications.length})
              </h3>
              {userApplications.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No active applications being tracked yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-2.5 text-sm"
                    >
                      <span className="truncate font-medium">
                        {app.opportunityTitle}
                      </span>
                      <span className="text-muted-foreground">{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

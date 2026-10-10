"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Users, Compass, FileCheck2, Sparkles, Shield, Database, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, FadeIn, StatCard } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_STATS, OPPORTUNITIES } from "@/lib/mock-data";
import {
  getOpportunitiesFromFirestore,
  addOpportunityToFirestore,
  seedAllSchemesToFirestore,
} from "@/lib/db";
import type { Opportunity, OpportunityCategory } from "@/lib/types";

const AI_USAGE_DATA = [
  { day: "Mon", queries: 2100 },
  { day: "Tue", queries: 2450 },
  { day: "Wed", queries: 2680 },
  { day: "Thu", queries: 2520 },
  { day: "Fri", queries: 2847 },
  { day: "Sat", queries: 1920 },
  { day: "Sun", queries: 1650 },
];

const WEEKLY_APPLICATIONS = [
  { week: "W1", count: 1820 },
  { week: "W2", count: 2105 },
  { week: "W3", count: 2340 },
  { week: "W4", count: 2656 },
];

const CATEGORIES: OpportunityCategory[] = [
  "Scholarship",
  "Internship",
  "Research",
  "Hackathon",
  "Startup Grant",
  "Skill Development",
  "Healthcare",
  "Education",
];

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(OPPORTUNITIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newCategory, setNewCategory] = useState<OpportunityCategory>("Scholarship");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getOpportunitiesFromFirestore()
      .then(setOpportunities)
      .catch(() => {});
  }, []);

  const handleSyncFirestore = async () => {
    setSyncing(true);
    try {
      const count = await seedAllSchemesToFirestore((done, total) => {
        toast.info(`Syncing: ${done}/${total} schemes...`, { id: "sync-progress" });
      });
      toast.success(`Successfully synced ${count} schemes to Firestore!`, { id: "sync-progress" });
      const refreshed = await getOpportunitiesFromFirestore();
      setOpportunities(refreshed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sync failed";
      toast.error(`Sync failed: ${message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddScheme = async () => {
    if (!newTitle.trim() || !newOrg.trim()) return;

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      category: newCategory,
      description: "Newly added scheme — pending full verification and indexing.",
      benefits: ["To be updated"],
      eligibility: ["To be verified"],
      documents: ["Aadhaar"],
      deadline: "2026-12-31",
      amount: "TBD",
      location: "Pan India",
      officialUrl: "https://www.india.gov.in",
      verified: false,
      tags: ["new"],
      matchScore: 50,
      eligibilityStatus: "Likely Eligible",
      eligibilityReasons: ["Pending profile match after verification"],
      publishedAt: new Date().toISOString().split("T")[0],
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    setNewTitle("");
    setNewOrg("");
    setDialogOpen(false);

    try {
      await addOpportunityToFirestore(newOpp);
      toast.success("Scheme saved to Firestore database");
    } catch {
      toast.info("Scheme added to local session");
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Admin Panel"
          description="Platform overview, opportunity management, and AI usage analytics."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSyncFirestore}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Database className="h-4 w-4 text-primary" />
                )}
                {syncing ? "Syncing to Firebase..." : "Seed / Sync to Firestore"}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={<Button className="gap-2" />}
                >
                  <Plus className="h-4 w-4" />
                  Add scheme
                </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add new scheme</DialogTitle>
                  <DialogDescription>
                    Add a scheme to the index. It will appear as unverified until reviewed.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Scheme name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org">Organization</Label>
                    <Input
                      id="org"
                      value={newOrg}
                      onChange={(e) => setNewOrg(e.target.value)}
                      placeholder="Ministry or department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newCategory}
                      onValueChange={(v) =>
                        v && setNewCategory(v as OpportunityCategory)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddScheme}>Add scheme</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
    </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={ADMIN_STATS.totalUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Opportunities"
            value={opportunities.length.toLocaleString()}
            subtitle={`${ADMIN_STATS.activeSchemes} active schemes`}
            icon={<Compass className="h-4 w-4" />}
          />
          <StatCard
            title="Applications"
            value={ADMIN_STATS.applicationsSubmitted.toLocaleString()}
            icon={<FileCheck2 className="h-4 w-4" />}
          />
          <StatCard
            title="AI Queries Today"
            value={ADMIN_STATS.aiQueriesToday.toLocaleString()}
            icon={<Sparkles className="h-4 w-4" />}
          />
          <StatCard
            title="Verification Rate"
            value={`${ADMIN_STATS.verificationRate}%`}
            icon={<Shield className="h-4 w-4" />}
          />
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base">AI queries (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={AI_USAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="queries" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base">Weekly applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={WEEKLY_APPLICATIONS}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-base">Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.slice(0, 10).map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {opp.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{opp.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(opp.deadline), "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {opp.verified ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 text-success"
                        >
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

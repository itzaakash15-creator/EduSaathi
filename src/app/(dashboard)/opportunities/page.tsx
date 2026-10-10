"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { searchOpportunities } from "@/lib/api";
import { CATEGORIES } from "@/lib/mock-data";

const ALL_CATEGORIES = ["All", ...CATEGORIES.map((c) => c.name)];

export default function OpportunitiesPage() {
  const { profile } = useAuth();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchOpportunities(query, category, profile),
    [query, category, profile]
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Opportunities"
          description="Browse verified government schemes, scholarships, internships, and grants matched to your profile."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, organization, or keyword…"
              className="h-10.5 rounded-xl border-indigo-100/80 bg-white/80 pl-10 backdrop-blur-xl shadow-2xs focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
            />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {results.length} opportunit{results.length === 1 ? "y" : "ies"} found
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs value={category} onValueChange={(v) => v && setCategory(String(v))}>
          <TabsList className="h-auto flex-wrap justify-start gap-1.5 bg-transparent p-0">
            {ALL_CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full border border-indigo-100/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white data-active:border-indigo-600 data-active:bg-gradient-to-tr data-active:from-indigo-600 data-active:to-blue-600 data-active:text-white data-active:shadow-xs"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((opp, i) => (
          <FadeIn key={opp.id} delay={0.05 + (i % 6) * 0.03}>
            <OpportunityCard opportunity={opp} />
          </FadeIn>
        ))}
      </div>

      {results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-indigo-200/80 bg-white/50 py-16 text-center backdrop-blur-md">
          <p className="text-sm text-slate-500">
            No opportunities match your filters. Try a different category or search term.
          </p>
        </div>
      )}
    </div>
  );
}

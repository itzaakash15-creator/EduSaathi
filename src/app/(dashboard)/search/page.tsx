"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { searchOpportunities } from "@/lib/api";

const EXAMPLE_QUERIES = [
  "scholarships under ₹8 lakh income",
  "engineering student internships",
  "startup grants for founders",
  "health schemes in Andhra Pradesh",
  "hackathons for college students",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setActiveQuery(q);
  }, [searchParams]);

  const results = searchOpportunities(activeQuery, undefined, profile);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query.trim());
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Search"
          description="Describe what you are looking for in plain language. EduSaathi matches your query against verified opportunities."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "scholarships for engineering students under ₹8 lakh"'
              className="h-11 pl-9"
            />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQuery(q);
                setActiveQuery(q);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              {q}
            </button>
          ))}
        </div>
      </FadeIn>

      {activeQuery && (
        <FadeIn delay={0.15}>
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
            {activeQuery}&rdquo;
          </p>
        </FadeIn>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>

      {activeQuery && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No matches found. Try broader terms like &ldquo;scholarship&rdquo; or
            &ldquo;internship&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

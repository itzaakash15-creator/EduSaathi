"use client";

import { useState } from "react";
import { FileText, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { explainDocument } from "@/lib/api";
import type { DocumentExplanation } from "@/lib/types";

const SAMPLE_NOTIFICATION = `GOVERNMENT OF INDIA
Ministry of Education — Scholarship Notification 2026

Post Matric Scholarship for students from economically weaker sections.

Eligibility: Indian citizens enrolled in recognized institutions with family income below ₹8 lakh per annum. Minimum 50% marks in previous examination required.

Benefits: Tuition fee reimbursement up to ₹50,000 per year, maintenance allowance, and book grant.

Documents: Aadhaar, income certificate, mark sheets, admission letter, bank passbook.

Last date for online submission: 30 September 2026 via scholarships.gov.in only.`;

export default function DocumentExplainerPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentExplanation | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "application/pdf") {
      setText(
        `[Uploaded: ${file.name}]\n\n${SAMPLE_NOTIFICATION}\n\n(Simulated text extraction from PDF — connect OCR backend for production.)`
      );
    } else {
      const content = await file.text();
      setText(content);
    }
  };

  const handleExplain = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const explanation = await explainDocument(text);
      setResult(explanation);
      setCheckedItems(new Set());
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Document Explainer"
          description="Upload a government PDF or paste notification text. EduSaathi AI extracts eligibility, deadlines, and action items."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs defaultValue="upload">
          <TabsList>
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="paste">Paste text</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <Card className="rounded-3xl border-2 border-dashed border-indigo-200/80 bg-white/70 backdrop-blur-xl shadow-xs transition-colors hover:border-indigo-400 hover:bg-white/90">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100 shadow-xs">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm font-semibold text-slate-800">
                  Drop a government notification PDF
                </p>
                <p className="mb-4 text-xs text-slate-500">
                  Supports PDF up to 10 MB
                </p>
                <label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleFile}
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 px-5 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-transform hover:scale-102">
                    Choose file
                  </span>
                </label>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="paste" className="mt-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full notification text here…"
              className="min-h-[200px] resize-y rounded-2xl border-indigo-100/80 bg-white/80 backdrop-blur-xl p-4 shadow-2xs focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
            />
          </TabsContent>
        </Tabs>

        {text && (
          <div className="mt-4 rounded-xl border border-indigo-100/80 bg-white/70 backdrop-blur-md p-3.5 shadow-2xs">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Input preview
            </p>
            <p className="text-sm text-slate-600 line-clamp-4">{text}</p>
          </div>
        )}

        <Button
          className="mt-4 h-11 gap-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 px-6 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-600"
          onClick={handleExplain}
          disabled={!text.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing document…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Explain document
            </>
          )}
        </Button>
      </FadeIn>

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.1}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-600">
                {result.summary}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                  {result.eligibility.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Required documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                  {result.requiredDocuments.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Deadline</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-medium text-slate-700">
                {result.deadline}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Important notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {result.importantNotes.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25} className="lg:col-span-2">
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">Action checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.actionChecklist.map((item, i) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-indigo-50 bg-white/60 px-4 py-3 transition-colors hover:bg-white hover:border-indigo-200"
                  >
                    <Checkbox
                      checked={checkedItems.has(i)}
                      onCheckedChange={() => toggleCheck(i)}
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                    {checkedItems.has(i) && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />
                    )}
                  </label>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3} className="lg:col-span-2">
            <Card className="rounded-2xl border-indigo-100/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-indigo-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 font-semibold">FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion>
                  {result.faqs.map((faq, i) => (
                    <AccordionItem key={faq.question} value={`faq-${i}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}
    </div>
  );
}

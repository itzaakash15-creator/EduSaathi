"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { interestChipClass } from "@/app/(auth)/_components/auth-shared";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const INCOME_RANGES = [
  "Under ₹2.5 Lakh",
  "₹2.5–4 Lakh",
  "₹4–8 Lakh",
  "₹8–15 Lakh",
  "Above ₹15 Lakh",
];

const INTEREST_OPTIONS = [
  "Scholarships",
  "Internships",
  "Startup Grants",
  "Research",
  "Welfare",
  "Healthcare",
  "Education",
  "Housing",
  "Skill Development",
  "Hackathons",
  "Women Schemes",
  "Farmer Schemes",
];

const CATEGORY_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];

const STEPS = [
  { title: "About you", description: "Basic personal details" },
  { title: "Background", description: "Education and occupation" },
  { title: "Interests", description: "What you're looking for" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading, updateUserProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [disabilityStatus, setDisabilityStatus] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!profile) return;
    if (profile.profileComplete) {
      router.replace("/dashboard");
      return;
    }
    setName(profile.name || "");
    setAge(profile.age ? String(profile.age) : "");
    setCountry(profile.country || "India");
    setState(profile.state || "");
    setOccupation(profile.occupation || "");
    setEducation(profile.education || "");
    setIncome(profile.income || "");
    setSkillsInput(profile.skills?.join(", ") || "");
    setInterests(profile.interests || []);
    setDisabilityStatus(profile.disabilityStatus || "");
    setCategory(profile.category || "");
  }, [profile, router]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateStep = () => {
    if (step === 0) {
      if (!name.trim()) {
        toast.error("Please enter your name.");
        return false;
      }
      if (!state) {
        toast.error("Please select your state.");
        return false;
      }
    }
    if (step === 1) {
      if (!occupation.trim()) {
        toast.error("Please enter your occupation.");
        return false;
      }
      if (!education.trim()) {
        toast.error("Please enter your education.");
        return false;
      }
      if (!income) {
        toast.error("Please select your income range.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        country,
        state,
        occupation: occupation.trim(),
        education: education.trim(),
        income,
        skills,
        interests,
        disabilityStatus: disabilityStatus || undefined,
        category: category || undefined,
      });
      toast.success("Profile saved! Welcome to EduSaathi.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="gradient-mesh flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="gradient-mesh min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 flex items-center justify-between">
            <Logo href="/dashboard" />
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <div className="mb-8 space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Complete your profile
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Help us match you with the right scholarships, grants, and schemes.
            </p>
            <Progress value={progress} className="h-1.5" />
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className={cn(
                    "flex flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors",
                    i === step
                      ? "border-primary/30 bg-primary/5"
                      : i < step
                        ? "border-primary/20 bg-primary/[0.02]"
                        : "border-border bg-card"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      i <= step ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {i < step ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {s.title}
                      </span>
                    ) : (
                      s.title
                    )}
                  </span>
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {s.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/60 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardTitle>{STEPS[step].title}</CardTitle>
              <CardDescription>{STEPS[step].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="h-10"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min={10}
                            max={100}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="21"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>State / UT</Label>
                        <Select value={state} onValueChange={(v) => v && setState(String(v))}>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="Student, Farmer, Professional…"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input
                          id="education"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="B.Tech Computer Science (2nd Year)"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Annual family income</Label>
                        <Select value={income} onValueChange={(v) => v && setIncome(String(v))}>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select income range" />
                          </SelectTrigger>
                          <SelectContent>
                            {INCOME_RANGES.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills</Label>
                        <Textarea
                          id="skills"
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          placeholder="Python, React, Public Speaking (comma-separated)"
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label>Interests</Label>
                        <p className="text-xs text-muted-foreground">
                          Select all that apply — we&apos;ll tailor opportunities for you.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {INTEREST_OPTIONS.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={interestChipClass(interests.includes(interest))}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Disability status (optional)</Label>
                          <Select
                            value={disabilityStatus}
                            onValueChange={(v) => v && setDisabilityStatus(String(v))}
                          >
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Select if applicable" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="Prefer not to say">
                                Prefer not to say
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Category (optional)</Label>
                          <Select value={category} onValueChange={(v) => v && setCategory(String(v))}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 0 || saving}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="gap-1.5">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Complete setup
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Your data is used only to match eligible schemes.{" "}
            <Link href="/profile" className="text-primary hover:underline">
              Privacy details
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

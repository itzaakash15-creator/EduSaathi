"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
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
import { useAuth } from "@/contexts/auth-context";
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
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const INCOME_RANGES = [
  "Under ₹2.5 Lakh",
  "₹2.5–4 Lakh",
  "₹4–8 Lakh",
  "₹8–12 Lakh",
  "Above ₹12 Lakh",
];

const INTEREST_OPTIONS = [
  "Scholarships",
  "Internships",
  "Startup Grants",
  "Research",
  "Hackathons",
  "Skill Development",
  "Healthcare",
  "Housing",
];

const CATEGORIES = [
  "General",
  "OBC",
  "SC",
  "ST",
  "EWS",
  "PwD",
];

export default function ProfilePage() {
  const { profile, updateUserProfile, loading } = useAuth();
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
  const [disabilityStatus, setDisabilityStatus] = useState("None");
  const [category, setCategory] = useState("General");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setAge(profile.age?.toString() || "");
    setCountry(profile.country);
    setState(profile.state);
    setOccupation(profile.occupation);
    setEducation(profile.education);
    setIncome(profile.income);
    setSkillsInput(profile.skills.join(", "));
    setInterests(profile.interests);
    setDisabilityStatus(profile.disabilityStatus || "None");
    setCategory(profile.category || "General");
  }, [profile]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
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
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Profile"
          description="Keep your profile up to date for accurate eligibility matching and recommendations."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <form onSubmit={handleSave}>
          <Card className="rounded-2xl border-border shadow-sm shadow-slate-900/5">
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                This data is used to match you with government schemes and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
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
                <div className="space-y-2">
                  <Label>State / UT</Label>
                  <Select value={state} onValueChange={(v) => v && setState(String(v))}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select state" />
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
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Income range</Label>
                  <Select value={income} onValueChange={(v) => v && setIncome(String(v))}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select income" />
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
                  <Label>Social category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => v && setCategory(String(v))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Disability status</Label>
                  <Select
                    value={disabilityStatus}
                    onValueChange={(v) => v && setDisabilityStatus(String(v))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Python, React, Public Speaking…"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        interestChipClass,
                        interests.includes(interest) &&
                          "border-primary bg-primary/10 text-primary"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="min-w-32">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save profile"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </FadeIn>
    </div>
  );
}

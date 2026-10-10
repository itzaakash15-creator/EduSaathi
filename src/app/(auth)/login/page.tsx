"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AuthDivider,
  getAuthErrorMessage,
  GoogleSignInButton,
} from "../_components/auth-shared";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, signInEmail, signInGoogle, signInDemo, firebaseReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"email" | "google" | "demo" | null>(null);
  const [awaitingProfile, setAwaitingProfile] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (awaitingProfile && !profile) return;

    if (profile && !profile.profileComplete) {
      router.replace("/onboarding");
    } else if (profile) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router, awaitingProfile]);

  const handleDemoLogin = async () => {
    setSubmitting("demo");
    try {
      await signInDemo();
      toast.success("Welcome! Entering as Demo Citizen...");
      router.replace("/dashboard");
    } catch {
      toast.error("Could not sign in with demo mode");
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting("email");
    try {
      await signInEmail(email.trim(), password);
      toast.success("Welcome back!");
      setAwaitingProfile(true);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  };

  const handleGoogle = async () => {
    setSubmitting("google");
    try {
      await signInGoogle();
      toast.success("Signed in with Google");
      setAwaitingProfile(true);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const busy = submitting !== null;

  return (
    <Card className="rounded-3xl border border-indigo-100/80 bg-white/85 p-2 backdrop-blur-2xl shadow-xl shadow-indigo-500/[0.04]">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl font-bold text-slate-900">Sign in</CardTitle>
        <CardDescription className="text-slate-500">
          Access your personalized civic opportunity dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instant 1-Click Demo Login */}
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-violet-50/60 p-4.5 text-center space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Instant Direct Entry
          </div>
          <p className="text-xs text-slate-600">
            Explore all verified schemes, document vault, tracker & AI tools instantly without password.
          </p>
          <Button
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="h-10.5 w-full gap-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 font-semibold text-white shadow-md shadow-indigo-500/25 transition-transform hover:scale-102 hover:shadow-indigo-500/35"
          >
            {submitting === "demo" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Demo Login (Direct Entry)
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-indigo-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-white/80 px-2 text-slate-400">
              Or sign in with account
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="h-10.5 rounded-xl border-indigo-100/80 bg-white/80 shadow-2xs focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="h-10.5 rounded-xl border-indigo-100/80 bg-white/80 shadow-2xs focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
            />
          </div>
          <Button type="submit" variant="outline" className="h-10.5 w-full rounded-xl border-indigo-200/80 bg-white font-medium text-slate-700 shadow-2xs hover:bg-indigo-50/50 hover:border-indigo-300" disabled={busy}>
            {submitting === "email" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign in with Email"
            )}
          </Button>
        </form>

        <AuthDivider />

        <div className="space-y-3">
          <GoogleSignInButton onClick={handleGoogle} loading={submitting === "google"} />
          {!firebaseReady && (
            <p className="text-center text-xs text-muted-foreground">
              Firebase is not configured. Add keys to `.env.local` to enable live auth.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t-0 pt-0">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

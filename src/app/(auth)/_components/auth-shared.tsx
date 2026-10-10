"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#f8fbff] overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-indigo-200/45 via-blue-200/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-purple-200/40 via-violet-100/30 to-transparent blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <div className="hidden flex-1 flex-col justify-between p-10 lg:flex xl:p-14">
          <Logo href="/" />
          <div className="max-w-md space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 xl:text-4xl">
              Your bridge to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                civic opportunities
              </span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Scholarships, grants, internships, and welfare schemes — matched to your
              profile with AI-powered guidance.
            </p>
            <ul className="space-y-3.5 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xs" />
                Personalized eligibility checks
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xs" />
                Document vault & application tracking
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xs" />
                AI assistant for scheme discovery
              </li>
            </ul>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EduSaathi AI
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="mb-8 lg:hidden">
            <Logo href="/" className="justify-center" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function GoogleSignInButton({
  onClick,
  loading,
  label = "Continue with Google",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full gap-2 border-border/80 bg-background font-normal"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {label}
    </Button>
  );
}

export function DemoSignInButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="h-10 w-full font-normal"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Continue with Demo
    </Button>
  );
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/operation-not-allowed":
      "This sign-in method is disabled. Enable Email/Password or Google in Firebase Console → Authentication → Sign-in method.",
    "auth/unauthorized-domain":
      "This domain is not authorized. Add localhost under Firebase Authentication → Settings → Authorized domains.",
  };
  if (code && messages[code]) return messages[code];
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function interestChipClass(selected: boolean) {
  return cn(
    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
    selected
      ? "border-primary bg-primary/10 text-primary"
      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-secondary"
  );
}

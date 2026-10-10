"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute({
  children,
  requireProfile = false,
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireProfile && profile && !profile.profileComplete) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, requireProfile, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading EduSaathi…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

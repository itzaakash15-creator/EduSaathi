"use client";

import { ProtectedRoute } from "@/components/shared/protected-route";
import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireProfile={false}>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

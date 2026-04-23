"use client";

import { DashboardNav } from "./DashboardNav";
import { useAuth } from "./Providers";
import type { UserRole } from "@/lib/types";

export function DashboardNavShell() {
  const { auth } = useAuth();
  const viewerRole: UserRole | null | "loading" =
    auth.status === "loading"
      ? "loading"
      : auth.status === "authenticated"
        ? auth.user.role
        : null;

  return <DashboardNav viewerRole={viewerRole} />;
}

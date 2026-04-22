"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./providers";
import type { UserRole } from "@/lib/types";

export function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.status === "anonymous") {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(auth.user.role)) {
      router.replace("/dashboard");
    }
  }, [auth, roles, router]);

  if (auth.status !== "authenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Checking session…
      </div>
    );
  }
  if (roles && !roles.includes(auth.user.role)) {
    return null;
  }
  return <>{children}</>;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, registerAuthRecovery } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: User; accessToken: string };

type AuthContextValue = {
  auth: AuthState;
  setSession: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const rotateAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const data = await authApi.refresh();
      setAuth({ status: "authenticated", user: data.user, accessToken: data.accessToken });
      return data.accessToken;
    } catch {
      setAuth({ status: "anonymous" });
      return null;
    }
  }, []);

  useEffect(() => {
    registerAuthRecovery(rotateAccessToken);
    return () => {
      registerAuthRecovery(null);
    };
  }, [rotateAccessToken]);

  const refreshSession = useCallback(async () => {
    await rotateAccessToken();
  }, [rotateAccessToken]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const setSession = useCallback((user: User, accessToken: string) => {
    setAuth({ status: "authenticated", user, accessToken });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAuth({ status: "anonymous" });
    }
  }, []);

  const value = useMemo(
    () => ({ auth, setSession, logout, refreshSession }),
    [auth, setSession, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within Providers");
  }
  return ctx;
}

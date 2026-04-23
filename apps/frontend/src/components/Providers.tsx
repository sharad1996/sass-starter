"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi, registerAuthRecovery } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: User; accessToken: string };

export type AuthContextValue = {
  auth: AuthState;
  setSession: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  /** Bumps when the user logs in or out so in-flight refresh calls cannot overwrite the newer session. */
  const refreshEpoch = useRef(0);

  const bumpRefreshEpoch = useCallback(() => {
    refreshEpoch.current += 1;
  }, []);

  const rotateAccessToken = useCallback(async (): Promise<string | null> => {
    const startedAt = refreshEpoch.current;
    try {
      const data = await authApi.refresh();
      if (startedAt !== refreshEpoch.current) {
        return null;
      }
      setAuth({ status: "authenticated", user: data.user, accessToken: data.accessToken });
      return data.accessToken;
    } catch {
      if (startedAt !== refreshEpoch.current) {
        return null;
      }
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

  const setSession = useCallback(
    (user: User, accessToken: string) => {
      bumpRefreshEpoch();
      setAuth({ status: "authenticated", user, accessToken });
    },
    [bumpRefreshEpoch]
  );

  const logout = useCallback(async () => {
    bumpRefreshEpoch();
    try {
      await authApi.logout();
    } finally {
      setAuth({ status: "anonymous" });
    }
  }, [bumpRefreshEpoch]);

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

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./AuthGuard";
import { AuthContext, type AuthContextValue } from "./Providers";
import type { User, UserRole } from "@/lib/types";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
}));

const user: User = { id: "1", email: "a@b.com", name: "A", role: "USER" };

function renderWithAuth(auth: AuthContextValue["auth"], roles?: UserRole[]) {
  const value: AuthContextValue = {
    auth,
    setSession: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshSession: vi.fn().mockResolvedValue(undefined),
  };
  return render(
    <AuthContext.Provider value={value}>
      <AuthGuard roles={roles}>
        <span data-testid="protected">Protected</span>
      </AuthGuard>
    </AuthContext.Provider>
  );
}

describe("AuthGuard", () => {
  it("shows loading copy while auth is loading", () => {
    renderWithAuth({ status: "loading" });
    expect(screen.getByText("Checking session…")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderWithAuth({ status: "authenticated", user, accessToken: "tok" });
    expect(screen.getByTestId("protected")).toBeInTheDocument();
  });

  it("redirects anonymous users to login", async () => {
    replace.mockClear();
    renderWithAuth({ status: "anonymous" });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows access denied for non-admin on admin-only routes", () => {
    replace.mockClear();
    renderWithAuth({ status: "authenticated", user, accessToken: "tok" }, ["ADMIN"]);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Insufficient permissions/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to overview/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("allows admin through when roles require ADMIN", () => {
    const adminUser: User = { ...user, role: "ADMIN" };
    renderWithAuth({ status: "authenticated", user: adminUser, accessToken: "tok" }, ["ADMIN"]);
    expect(screen.getByTestId("protected")).toBeInTheDocument();
  });
});

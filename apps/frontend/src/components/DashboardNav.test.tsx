import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardNav } from "./DashboardNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("DashboardNav", () => {
  it("marks Overview active on /dashboard", () => {
    render(<DashboardNav pathnameOverride="/dashboard" viewerRole="USER" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Billing" })).not.toHaveAttribute("aria-current");
  });

  it("marks Billing active on /dashboard/billing", () => {
    render(<DashboardNav pathnameOverride="/dashboard/billing" viewerRole="USER" />);
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("shows Admin tab only for ADMIN viewer", () => {
    const { rerender } = render(<DashboardNav pathnameOverride="/dashboard" viewerRole="USER" />);
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();

    rerender(<DashboardNav pathnameOverride="/dashboard/admin" viewerRole="ADMIN" />);
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("aria-current", "page");
  });

  it("hides Admin tab while viewer role is loading", () => {
    render(<DashboardNav pathnameOverride="/dashboard" viewerRole="loading" />);
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });
});

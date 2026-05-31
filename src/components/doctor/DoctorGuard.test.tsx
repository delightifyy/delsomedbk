import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DoctorGuard } from "./DoctorGuard";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/localStore", () => ({
  signInDoctorWithPassword: vi.fn(),
  signInWithPassword: vi.fn(),
}));

describe("DoctorGuard", () => {
  it("allows super admins to access the doctor CMS", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isAdmin: true,
      loading: false,
      signOut: vi.fn(),
    });

    render(
      <DoctorGuard>
        <div>secured content</div>
      </DoctorGuard>,
    );

    expect(screen.getByText("secured content")).toBeInTheDocument();
    expect(screen.queryByText("MediCare Admin Login")).not.toBeInTheDocument();
  });
});
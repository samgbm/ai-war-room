import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Boom(): never {
  throw new Error("simulated render breach");
}

describe("ErrorBoundary", () => {
  it("catches child errors and shows the System Fault fallback", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: /system fault/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/simulated render breach/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reboot server/i }),
    ).toBeInTheDocument();

    spy.mockRestore();
  });
});

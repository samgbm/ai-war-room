import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PortalProviderWrapper } from "@/components/PortalProviderWrapper";

vi.mock("@portalsdk/core", () => {
  class Portal {
    apiKey: string;
    constructor(config: { apiKey: string }) {
      this.apiKey = config.apiKey;
    }
    setToken = vi.fn();
  }
  return { Portal };
});

vi.mock("@portalsdk/react", () => ({
  PortalProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="portal-provider">{children}</div>
  ),
}));

describe("PortalProviderWrapper", () => {
  it("renders children successfully in Anonymous Mode", () => {
    render(
      <PortalProviderWrapper>
        <span>war-room-child</span>
      </PortalProviderWrapper>,
    );

    expect(screen.getByTestId("portal-provider")).toBeInTheDocument();
    expect(screen.getByText("war-room-child")).toBeInTheDocument();
  });
});

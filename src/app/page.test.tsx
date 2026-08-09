import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "command",
    setTheme: vi.fn(),
    resolvedTheme: "command",
    themes: ["command"],
    systemTheme: "dark",
  }),
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@portalsdk/react", () => ({
  useChannel: () => ({
    messages: [],
    send: vi.fn(),
    loadPrevious: vi.fn(),
    hasPrevious: false,
    isLoadingPrevious: false,
    status: "ready",
  }),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /the ai war room/i }),
    ).toBeInTheDocument();
  });
});

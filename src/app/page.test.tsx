import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@portalsdk/react", () => ({
  useChannel: () => ({
    messages: [],
    send: vi.fn(),
    presence: null,
    typing: [],
    sendTyping: vi.fn(),
    status: "ready",
    me: { id: "test-user", anon: true, claims: {} },
    setMetadata: vi.fn(),
    unread: 0,
    markAsRead: vi.fn(),
  }),
  PortalProvider: ({ children }: { children: ReactNode }) => children,
}));

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

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /alpha strike/i }),
    ).toBeInTheDocument();
  });
});

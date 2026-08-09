import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "./theme-switcher";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "command",
    setTheme: vi.fn(),
    resolvedTheme: "command",
    themes: ["command", "midnight"],
    systemTheme: "dark",
  }),
}));

describe("ThemeSwitcher", () => {
  it("renders correctly and contains a button trigger", () => {
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole("button", { name: /theme:/i });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });
});

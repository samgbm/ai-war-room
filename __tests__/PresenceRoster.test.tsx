import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PresenceRoster } from "@/components/PresenceRoster";

vi.mock("@/components/WarRoomChannelProvider", () => ({
  useWarRoomChannel: () => ({
    presence: {
      kind: "detailed",
      participants: [
        { id: "anon_alpha_01", anon: true },
        { id: "anon_bravo_02", username: "Watch Desk", anon: false },
      ],
    },
  }),
}));

describe("PresenceRoster", () => {
  it("renders participant IDs from detailed presence", () => {
    render(<PresenceRoster />);

    expect(screen.getByText("anon_alpha_01")).toBeInTheDocument();
    expect(screen.getByText("Watch Desk")).toBeInTheDocument();
    expect(screen.getByLabelText("Online operators")).toBeInTheDocument();
  });
});

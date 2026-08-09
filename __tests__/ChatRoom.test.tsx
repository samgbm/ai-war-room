import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatRoom } from "@/components/ChatRoom";

vi.mock("@portalsdk/react", () => ({
  useChannel: () => ({
    messages: [
      {
        id: "msg-1",
        sender: { id: "op-lead" },
        content: { text: "Alpha desk is live." },
      },
      {
        id: "msg-2",
        sender: { id: "scout" },
        content: { text: "Recon sweep complete." },
      },
    ],
    send: vi.fn(),
    loadPrevious: vi.fn(),
    hasPrevious: true,
    isLoadingPrevious: false,
    status: "ready",
  }),
}));

describe("ChatRoom", () => {
  it("renders mock messages and the input form", () => {
    render(<ChatRoom roomId="war-room-alpha" />);

    expect(screen.getByText("Alpha desk is live.")).toBeInTheDocument();
    expect(screen.getByText("Recon sweep complete.")).toBeInTheDocument();
    expect(screen.getByText("op-lead")).toBeInTheDocument();
    expect(screen.getByText("scout")).toBeInTheDocument();

    expect(screen.getByLabelText(/chat message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^send$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /load older/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});

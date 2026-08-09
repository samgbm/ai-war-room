import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatRoom } from "@/components/ChatRoom";

const onMessageHandlers: Array<(msg: unknown) => void> = [];

vi.mock("@portalsdk/react", () => ({
  useChannel: (opts: { onMessage?: (msg: unknown) => void }) => {
    if (opts.onMessage) onMessageHandlers.push(opts.onMessage);
    return {
      messages: [],
      send: vi.fn(),
      status: "ready",
    };
  },
}));

vi.mock("@/components/WarRoomChannelProvider", () => ({
  useWarRoomChannel: () => ({
    roomId: "war-room-alpha",
    messages: [
      {
        id: "msg-1",
        type: "message",
        ephemeral: false,
        sender: { id: "op-lead" },
        content: { text: "Alpha desk is live." },
      },
      {
        id: "msg-2",
        type: "message",
        ephemeral: false,
        sender: { id: "scout" },
        content: { text: "Recon sweep complete." },
      },
    ],
    send: vi.fn(),
    loadPrevious: vi.fn(),
    hasPrevious: true,
    isLoadingPrevious: false,
    status: "ready",
    typing: ["agent-007"],
    sendTyping: vi.fn(),
    presence: undefined,
  }),
}));

describe("ChatRoom", () => {
  it("renders mock messages, input form, and typing indicator", () => {
    render(<ChatRoom />);

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
    expect(screen.getByText("agent-007 is typing...")).toBeInTheDocument();
  });

  it("renders a live agent stream from ephemeral agent-stream chunks", async () => {
    const { act } = await import("@testing-library/react");
    render(<ChatRoom />);

    const handler = onMessageHandlers[onMessageHandlers.length - 1];
    expect(handler).toBeTypeOf("function");

    await act(async () => {
      handler({
        ephemeral: true,
        type: "agent-stream",
        sender: { id: "agent-bot" },
        content: { streamId: "stream-1", chunk: "Lima " },
      });
      handler({
        ephemeral: true,
        type: "agent-stream",
        sender: { id: "agent-bot" },
        content: { streamId: "stream-1", chunk: "is capital." },
      });
    });

    expect(screen.getByTestId("agent-stream")).toBeInTheDocument();
    expect(screen.getByText(/Lima is capital\./)).toBeInTheDocument();
    expect(screen.getByText(/Agent · streaming/i)).toBeInTheDocument();

    await act(async () => {
      handler({
        ephemeral: false,
        type: "message",
        sender: { id: "agent-bot" },
        content: { text: "Lima is capital." },
      });
    });

    expect(screen.queryByTestId("agent-stream")).not.toBeInTheDocument();
  });
});

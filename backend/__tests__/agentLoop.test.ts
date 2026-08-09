import { beforeEach, describe, expect, it, vi } from "vitest";

type MessageHandler = (msg: {
  ephemeral: boolean;
  type?: string;
  sender: { id: string };
  content: { text: string };
}) => void | Promise<void>;

const sendMock = vi.fn();
const sendActivityMock = vi.fn();
const setMetadataMock = vi.fn();
const acquireMock = vi.fn();
const streamAgentResponseMock = vi.fn();

let messageHandler: MessageHandler | undefined;

vi.mock("../src/portalClient.ts", () => ({
  portal: {
    channel: () => ({
      me: { id: "agent-bot", anon: true },
      acquire: acquireMock,
      send: sendMock,
      sendActivity: sendActivityMock,
      setMetadata: setMetadataMock,
      on: (event: string, fn: MessageHandler) => {
        if (event === "message") messageHandler = fn;
        return () => {};
      },
    }),
  },
}));

vi.mock("../src/ai/openaiClient.ts", () => ({
  streamAgentResponse: (...args: unknown[]) => streamAgentResponseMock(...args),
  generateAgentResponse: vi.fn(),
}));

describe("startAgentLoop", () => {
  beforeEach(() => {
    vi.resetModules();
    messageHandler = undefined;
    sendMock.mockReset();
    sendActivityMock.mockReset();
    setMetadataMock.mockReset();
    acquireMock.mockReset();
    streamAgentResponseMock.mockReset();
    sendMock.mockResolvedValue({ id: "ack-1", timestamp: Date.now() });

    streamAgentResponseMock.mockImplementation(
      async (prompt: string, onChunk: (chunk: string) => void) => {
        onChunk("Hello ");
        onChunk("operator.");
        return "Hello operator.";
      },
    );
  });

  it('streams ephemeral chunks then sends a persistent reply for "@Agent hello"', async () => {
    const { startAgentLoop } = await import("../src/ai/agentLoop.ts");
    await startAgentLoop();

    expect(acquireMock).toHaveBeenCalledTimes(1);
    expect(messageHandler).toBeTypeOf("function");

    await messageHandler?.({
      ephemeral: false,
      type: "message",
      sender: { id: "human-op" },
      content: { text: "@Agent hello" },
    });

    expect(sendActivityMock).toHaveBeenCalledWith("typing");
    expect(streamAgentResponseMock).toHaveBeenCalledWith(
      "@Agent hello",
      expect.any(Function),
    );

    const ephemeralCalls = sendMock.mock.calls.filter(
      ([payload]) => payload?.ephemeral === true && payload?.type === "agent-stream",
    );
    expect(ephemeralCalls.length).toBeGreaterThanOrEqual(2);
    expect(ephemeralCalls[0][0].content).toEqual(
      expect.objectContaining({
        streamId: expect.any(String),
        chunk: "Hello ",
      }),
    );

    expect(sendMock).toHaveBeenCalledWith({
      content: { text: "Hello operator." },
    });
    expect(setMetadataMock).toHaveBeenCalled();
  });

  it("ignores messages without an @Agent mention", async () => {
    const { startAgentLoop } = await import("../src/ai/agentLoop.ts");
    await startAgentLoop();

    await messageHandler?.({
      ephemeral: false,
      type: "message",
      sender: { id: "human-op" },
      content: { text: "status check only" },
    });

    expect(streamAgentResponseMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

type MessageHandler = (msg: {
  ephemeral: boolean;
  type?: string;
  sender: { id: string };
  content: { text: string };
}) => void | Promise<void>;

const sendMock = vi.fn();
const sendActivityMock = vi.fn();
const acquireMock = vi.fn();
const generateAgentResponseMock = vi.fn();

let messageHandler: MessageHandler | undefined;

vi.mock("../src/portalClient.ts", () => ({
  portal: {
    channel: () => ({
      me: { id: "agent-bot", anon: true },
      acquire: acquireMock,
      send: sendMock,
      sendActivity: sendActivityMock,
      on: (event: string, fn: MessageHandler) => {
        if (event === "message") messageHandler = fn;
        return () => {};
      },
    }),
  },
}));

vi.mock("../src/ai/openaiClient.ts", () => ({
  generateAgentResponse: (...args: unknown[]) =>
    generateAgentResponseMock(...args),
}));

describe("startAgentLoop", () => {
  beforeEach(() => {
    vi.resetModules();
    messageHandler = undefined;
    sendMock.mockReset();
    sendActivityMock.mockReset();
    acquireMock.mockReset();
    generateAgentResponseMock.mockReset();
    generateAgentResponseMock.mockResolvedValue("Lima is the capital of Peru.");
    sendMock.mockResolvedValue({ id: "ack-1", timestamp: Date.now() });
  });

  it('responds when a message contains "@Agent hello"', async () => {
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
    expect(generateAgentResponseMock).toHaveBeenCalledWith("@Agent hello");
    expect(sendMock).toHaveBeenCalledWith({
      content: { text: "Lima is the capital of Peru." },
    });
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

    expect(generateAgentResponseMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

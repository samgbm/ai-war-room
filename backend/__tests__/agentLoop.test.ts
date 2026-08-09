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
const generateAgentAudioMock = vi.fn();

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

vi.mock("../src/ai/elevenlabsClient.ts", () => ({
  generateAgentAudio: (...args: unknown[]) => generateAgentAudioMock(...args),
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
    generateAgentAudioMock.mockReset();
    sendMock.mockResolvedValue({ id: "ack-1", timestamp: Date.now() });

    streamAgentResponseMock.mockImplementation(
      async (_prompt: string, onChunk: (chunk: string) => void) => {
        onChunk("Hello ");
        onChunk("operator.");
        return "Hello operator.";
      },
    );

    generateAgentAudioMock.mockResolvedValue(Buffer.from("fake-mp3"));
  });

  it('streams, replies, caches audio, and broadcasts agent-audio for "@Agent hello"', async () => {
    const { audioCache } = await import("../src/audioCache.ts");
    audioCache.clear();

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

    const streamCalls = sendMock.mock.calls.filter(
      ([payload]) => payload?.type === "agent-stream",
    );
    expect(streamCalls.length).toBeGreaterThanOrEqual(1);
    expect(streamCalls.some(([payload]) => payload?.ephemeral === true)).toBe(
      true,
    );
    expect(
      streamCalls.some(
        ([payload]) =>
          payload?.ephemeral !== true &&
          typeof payload?.content?.text === "string",
      ),
    ).toBe(true);

    expect(sendMock).toHaveBeenCalledWith({
      content: { text: "Hello operator." },
    });
    expect(setMetadataMock).toHaveBeenCalled();

    expect(generateAgentAudioMock).toHaveBeenCalledWith("Hello operator.");

    const audioCalls = sendMock.mock.calls.filter(
      ([payload]) => payload?.type === "agent-audio",
    );
    expect(audioCalls.some(([payload]) => payload?.ephemeral === true)).toBe(
      true,
    );
    expect(audioCalls.some(([payload]) => payload?.ephemeral !== true)).toBe(
      true,
    );

    const audioId = audioCalls[0]?.[0]?.content?.audioId as string | undefined;
    expect(typeof audioId).toBe("string");
    expect(audioCache.get(audioId!)).toEqual(Buffer.from("fake-mp3"));
  });

  it("skips audio broadcast when ElevenLabs returns null", async () => {
    generateAgentAudioMock.mockResolvedValueOnce(null);
    const { audioCache } = await import("../src/audioCache.ts");
    audioCache.clear();

    const { startAgentLoop } = await import("../src/ai/agentLoop.ts");
    await startAgentLoop();

    await messageHandler?.({
      ephemeral: false,
      type: "message",
      sender: { id: "human-op" },
      content: { text: "@Agent hello" },
    });

    expect(generateAgentAudioMock).toHaveBeenCalled();
    expect(
      sendMock.mock.calls.some(([payload]) => payload?.type === "agent-audio"),
    ).toBe(false);
    expect(audioCache.size).toBe(0);
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
    expect(generateAgentAudioMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

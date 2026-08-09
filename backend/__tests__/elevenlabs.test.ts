import { beforeEach, describe, expect, it, vi } from "vitest";

const convertMock = vi.fn();

vi.mock("elevenlabs", () => {
  class ElevenLabsClient {
    textToSpeech = {
      convert: convertMock,
    };
  }
  return { ElevenLabsClient };
});

describe("generateAgentAudio", () => {
  beforeEach(() => {
    convertMock.mockReset();
    vi.resetModules();
  });

  it("calls the mocked ElevenLabs API and returns a Buffer", async () => {
    const payload = Buffer.from("fake-mp3-bytes");
    async function* fakeStream() {
      yield payload;
    }
    convertMock.mockResolvedValue(fakeStream());

    const { generateAgentAudio, DEFAULT_VOICE_ID } = await import(
      "../src/ai/elevenlabsClient.ts"
    );

    const result = await generateAgentAudio("Alpha desk is live.");

    expect(convertMock).toHaveBeenCalledTimes(1);
    expect(convertMock).toHaveBeenCalledWith(
      DEFAULT_VOICE_ID,
      expect.objectContaining({
        text: "Alpha desk is live.",
        model_id: "eleven_turbo_v2_5",
      }),
    );
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result?.equals(payload)).toBe(true);
  });

  it("returns null when the API fails", async () => {
    convertMock.mockRejectedValue(new Error("out of credits"));

    const { generateAgentAudio } = await import("../src/ai/elevenlabsClient.ts");
    const result = await generateAgentAudio("Anything");

    expect(result).toBeNull();
  });
});

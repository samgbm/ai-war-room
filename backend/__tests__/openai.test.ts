import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("openai", () => {
  class OpenAI {
    chat = {
      completions: {
        create: createMock,
      },
    };
  }
  return { default: OpenAI };
});

describe("openaiClient", () => {
  beforeEach(() => {
    createMock.mockReset();
    vi.resetModules();
  });

  it("generateAgentResponse calls the mocked OpenAI API and returns text", async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: "Recon complete. No active SEV." } }],
    });

    const { generateAgentResponse } = await import("../src/ai/openaiClient.ts");
    const result = await generateAgentResponse("Status report on Alpha.");

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            content: "Status report on Alpha.",
          }),
        ]),
      }),
    );
    expect(result).toBe("Recon complete. No active SEV.");
  });

  it("generateAgentResponse returns a fallback string when the API fails", async () => {
    createMock.mockRejectedValue(new Error("rate limited"));

    const { generateAgentResponse } = await import("../src/ai/openaiClient.ts");
    const result = await generateAgentResponse("Anything");

    expect(result).toBe(
      "Agent offline due to cognitive overload. Retry shortly.",
    );
  });

  it("streamAgentResponse emits chunks and returns the full string", async () => {
    async function* fakeStream() {
      yield { choices: [{ delta: { content: "Lima" } }] };
      yield { choices: [{ delta: { content: " is" } }] };
      yield { choices: [{ delta: { content: " capital." } }] };
    }
    createMock.mockResolvedValue(fakeStream());

    const chunks: string[] = [];
    const { streamAgentResponse } = await import("../src/ai/openaiClient.ts");
    const result = await streamAgentResponse("Capital of Peru?", (chunk) => {
      chunks.push(chunk);
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ stream: true, model: "gpt-4o-mini" }),
    );
    expect(chunks).toEqual(["Lima", " is", " capital."]);
    expect(result).toBe("Lima is capital.");
  });
});

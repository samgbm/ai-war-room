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

describe("generateAgentResponse", () => {
  beforeEach(() => {
    createMock.mockReset();
    vi.resetModules();
  });

  it("calls the mocked OpenAI API and returns the expected string", async () => {
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

  it("returns a fallback string when the API fails", async () => {
    createMock.mockRejectedValue(new Error("rate limited"));

    const { generateAgentResponse } = await import("../src/ai/openaiClient.ts");
    const result = await generateAgentResponse("Anything");

    expect(result).toBe(
      "Agent offline due to cognitive overload. Retry shortly.",
    );
  });
});

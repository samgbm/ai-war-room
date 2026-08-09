import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK =
  "Agent offline due to cognitive overload. Retry shortly.";

const SYSTEM_PROMPT = [
  "You are an AI War Room agent. Be concise, operational, and actionable.",
  "Reply in plain text only. Never use Markdown or rich formatting:",
  "no asterisks for bold/italic, no headings with #, no bullet markers like -, *, or numbered markdown lists,",
  "no code fences, no underscores for emphasis, and no HTML.",
  "Write short paragraphs or simple numbered lines using '1.' style only when a list is truly needed.",
].join(" ");

/** Strip common Markdown decorations the model sometimes still emits. */
export function toPlainText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```\w*\n?/g, "").replace(/```/g, ""),
    )
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Lightweight agent reasoning call — gpt-4o-mini for low-latency demos.
 */
export async function generateAgentResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 280,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    return text ? toPlainText(text) : FALLBACK;
  } catch (error) {
    console.error("[openai] generateAgentResponse failed:", error);
    return FALLBACK;
  }
}

/**
 * Stream tokens to onChunk as they arrive; return the full concatenated reply.
 */
export async function streamAgentResponse(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<string> {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 280,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    let full = "";
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content;
      if (!token) continue;
      full += token;
      onChunk(token);
    }

    const plain = toPlainText(full);
    return plain || FALLBACK;
  } catch (error) {
    console.error("[openai] streamAgentResponse failed:", error);
    onChunk(FALLBACK);
    return FALLBACK;
  }
}

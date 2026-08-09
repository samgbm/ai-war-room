import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK =
  "Agent offline due to cognitive overload. Retry shortly.";

const SYSTEM_PROMPT =
  "You are an AI War Room agent. Be concise, operational, and actionable.";

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
    return text || FALLBACK;
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

    return full.trim() || FALLBACK;
  } catch (error) {
    console.error("[openai] streamAgentResponse failed:", error);
    onChunk(FALLBACK);
    return FALLBACK;
  }
}

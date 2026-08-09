import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK =
  "Agent offline due to cognitive overload. Retry shortly.";

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
        {
          role: "system",
          content:
            "You are an AI War Room agent. Be concise, operational, and actionable.",
        },
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

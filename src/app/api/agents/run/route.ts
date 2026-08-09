import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type AgentRole = "scout" | "analyst" | "writer" | "fixer" | "sentinel";

const ROLE_PROMPTS: Record<AgentRole, string> = {
  scout:
    "You are Scout, a recon AI in an ops war room. Be concise, factual, and cite blast radius. 2-4 sentences.",
  analyst:
    "You are Analyst, an intel AI. Correlate signals, name likely root causes, recommend one action. 2-4 sentences.",
  writer:
    "You are Writer, a communications AI. Draft crisp status-page / stakeholder copy. 2-4 sentences.",
  fixer:
    "You are Fixer, a remediation AI. Propose concrete rollback/mitigation steps. 2-4 sentences.",
  sentinel:
    "You are Sentinel, a guard AI. Assess risk posture and watch items. 2-4 sentences.",
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Add it to .env.local (and Vercel env) to enable AI agents.",
      },
      { status: 503 },
    );
  }

  let body: { prompt?: string; role?: AgentRole; roomName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const role: AgentRole = body.role && ROLE_PROMPTS[body.role] ? body.role : "analyst";
  const roomName = body.roomName?.trim() || "War Room";

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 280,
      messages: [
        { role: "system", content: ROLE_PROMPTS[role] },
        {
          role: "user",
          content: `Room: ${roomName}\nOperator request:\n${prompt}`,
        },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "No response generated.";

    return NextResponse.json({
      role,
      agentName: role.charAt(0).toUpperCase() + role.slice(1),
      reply,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

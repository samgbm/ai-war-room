import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ai-war-room",
    portalConfigured: Boolean(process.env.NEXT_PUBLIC_PORTAL_KEY),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    time: new Date().toISOString(),
  });
}

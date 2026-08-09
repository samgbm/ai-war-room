import { portal } from "../portalClient.js";
import { generateAgentResponse } from "./openaiClient.js";

const ROOM_ID = "war-room-alpha";
const AGENT_MENTION = /@agent\b/i;

type ChatContent = {
  text?: string;
};

function contentText(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const text = (content as ChatContent).text;
  return typeof text === "string" ? text : null;
}

/**
 * Subscribe the backend AI agent to the war-room channel as another participant.
 */
export async function startAgentLoop(): Promise<void> {
  const room = portal.channel<ChatContent>(ROOM_ID);
  room.acquire();

  room.on("message", async (msg) => {
    try {
      if (msg.ephemeral) return;
      if (msg.type === "cursor") return;
      if (msg.sender.id === "system") return;
      if (room.me?.id && msg.sender.id === room.me.id) return;

      const text = contentText(msg.content);
      if (!text || !AGENT_MENTION.test(text)) return;

      room.sendActivity("typing");

      const reply = await generateAgentResponse(text);
      await room.send({ content: { text: reply } });
    } catch (error) {
      console.error("[agent] failed to handle message:", error);
    }
  });

  console.log(`[agent] listening on ${ROOM_ID} for @Agent mentions`);
}

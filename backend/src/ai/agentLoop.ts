import { portal } from "../portalClient.js";
import { streamAgentResponse } from "./openaiClient.js";

const ROOM_ID = "war-room-alpha";
const AGENT_MENTION = /@agent\b/i;

type ChatContent = {
  text?: string;
  streamId?: string;
  chunk?: string;
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
      if (msg.type === "cursor" || msg.type === "agent-stream") return;
      if (msg.sender.id === "system") return;
      if (room.me?.id && msg.sender.id === room.me.id) return;

      const text = contentText(msg.content);
      if (!text || !AGENT_MENTION.test(text)) return;

      room.sendActivity("typing");

      const streamId = Date.now().toString();
      let assembled = "";

      const fullReply = await streamAgentResponse(text, (chunk) => {
        assembled += chunk;
        void room.send({
          ephemeral: true,
          type: "agent-stream",
          content: { streamId, chunk },
        });
        // Presence mirror — Portal JS currently drops inbound ephemeral frames.
        room.setMetadata({ agentStream: { streamId, text: assembled } });
      });

      await room.send({ content: { text: fullReply } });
      room.setMetadata({});
    } catch (error) {
      console.error("[agent] failed to handle message:", error);
      room.setMetadata({});
    }
  });

  console.log(`[agent] listening on ${ROOM_ID} for @Agent mentions`);
}

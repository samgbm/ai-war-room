import { portal } from "../portalClient.js";
import { streamAgentResponse } from "./openaiClient.js";

const ROOM_ID = "war-room-alpha";
const AGENT_MENTION = /@agent\b/i;
/** Portal JS drops inbound ephemeral frames — mirror the stream with durable updates. */
const STREAM_FLUSH_MS = 50;

type ChatContent = {
  text?: string;
  streamId?: string;
  chunk?: string;
  status?: string;
};

function contentText(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const text = (content as ChatContent).text;
  return typeof text === "string" ? text : null;
}

async function setAgentStatus(
  room: ReturnType<typeof portal.channel<ChatContent>>,
  status: string,
) {
  await room.send({
    ephemeral: true,
    type: "agent.status",
    content: { status },
  });
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
      if (
        msg.type === "cursor" ||
        msg.type === "agent-stream" ||
        msg.type === "agent.status"
      ) {
        return;
      }
      if (msg.sender.id === "system") return;
      if (room.me?.id && msg.sender.id === room.me.id) return;

      const text = contentText(msg.content);
      if (!text || !AGENT_MENTION.test(text)) return;

      room.sendActivity("typing");
      await setAgentStatus(room, "Processing prompt...");

      const streamId = Date.now().toString();
      let assembled = "";
      let lastFlush = 0;

      const flushStream = (force = false) => {
        const now = Date.now();
        if (!force && now - lastFlush < STREAM_FLUSH_MS) return;
        lastFlush = now;
        void room.send({
          type: "agent-stream",
          content: { streamId, text: assembled, chunk: "" },
        });
        room.setMetadata({ agentStream: { streamId, text: assembled } });
      };

      const fullReply = await streamAgentResponse(text, (chunk) => {
        assembled += chunk;
        // Keep trying ephemeral (no-op on current Portal JS clients).
        void room.send({
          ephemeral: true,
          type: "agent-stream",
          content: { streamId, chunk },
        });
        flushStream(false);
      });

      flushStream(true);
      await room.send({
        content: { text: fullReply },
        mentions: [{ userId: msg.sender.id }],
      });
      room.setMetadata({});
      await setAgentStatus(room, "Standing by");
    } catch (error) {
      console.error("[agent] failed to handle message:", error);
      room.setMetadata({});
      try {
        await setAgentStatus(room, "Standing by");
      } catch {
        // ignore status reset failures
      }
    }
  });

  console.log(`[agent] listening on ${ROOM_ID} for @Agent mentions`);
}

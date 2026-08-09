import { describe, expect, it } from "vitest";
import portalConfig from "../portal.config.ts";

describe("portal.config.ts", () => {
  it("defines war-room-* with anonymous access and agentState extension", () => {
    expect(portalConfig).toHaveProperty("channels");
    expect(portalConfig.channels).toHaveProperty("war-room-*");
    expect(portalConfig.channels["war-room-*"]).toMatchObject({
      anonymous: true,
      extensions: {
        agentState: "./extensions/agentState.ts",
      },
    });
    expect(portalConfig.channels["war-room-*"].notify).toBeTypeOf("function");
  });

  it("notify returns a descriptor for messages with mentions", async () => {
    const notify = portalConfig.channels["war-room-*"].notify;
    expect(notify).toBeTypeOf("function");

    const result = await notify!({
      message: {
        id: "msg-1",
        type: "message",
        content: { text: "Here is a story about a space station." },
        kind: "text",
        mentions: [{ userId: "demo-human-operator" }],
        timestamp: Date.now(),
        ephemeral: false,
      },
      sender: {
        id: "agent-bot",
        anon: true,
        claims: {},
      },
    });

    expect(result).toEqual({
      title: "Agent Tagged You",
      data: { text: "Here is a story about a space station." },
      to: ["demo-human-operator"],
    });
  });

  it("notify returns null when mentions are empty", async () => {
    const notify = portalConfig.channels["war-room-*"].notify;
    expect(notify).toBeTypeOf("function");

    const result = await notify!({
      message: {
        id: "msg-2",
        type: "message",
        content: { text: "status only" },
        kind: "text",
        mentions: [],
        timestamp: Date.now(),
        ephemeral: false,
      },
      sender: {
        id: "agent-bot",
        anon: true,
        claims: {},
      },
    });

    expect(result).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import AgentState from "../extensions/agentState.ts";

describe("AgentState extension", () => {
  let extension: InstanceType<typeof AgentState>;

  beforeEach(() => {
    extension = new AgentState(
      {
        storage: {
          get: async () => undefined,
          put: async () => {},
          delete: async () => true,
          list: async () => new Map(),
        },
      },
      {},
    );
  });

  it("exposes the agent. namespace over ws", () => {
    expect(AgentState.manifest).toEqual({
      namespace: "agent.",
      transport: "ws",
    });
  });

  it("defaults snapshot status to Standing by", async () => {
    const snap = await extension.onSnapshot?.({
      kind: "snapshot",
      channelId: "war-room-alpha",
      epoch: 1,
    });
    expect(snap).toEqual({ snapshot: { status: "Standing by" } });
  });

  it("updates status on agent.status and marks snapshot dirty", async () => {
    const result = await extension.onBatch({
      kind: "batch",
      channelId: "war-room-alpha",
      epoch: 1,
      batchSeq: 1,
      messages: [
        {
          type: "agent.status",
          content: { status: "Processing prompt..." },
          senderId: "agent-bot",
          at: Date.now(),
        },
      ],
    });

    expect(result).toMatchObject({
      snapshotDirty: true,
      broadcasts: [
        {
          type: "agent.status",
          content: { status: "Processing prompt..." },
        },
      ],
    });

    const snap = await extension.onSnapshot?.({
      kind: "snapshot",
      channelId: "war-room-alpha",
      epoch: 1,
    });
    expect(snap).toEqual({
      snapshot: { status: "Processing prompt..." },
    });
  });
});

import {
  defineExtension,
  type BatchRequest,
  type ExtensionContext,
} from "@portalsdk/extension-protocol";

class AgentState {
  static manifest = {
    namespace: "agent.",
    transport: "ws",
  } as const;

  #currentStatus = "Standing by";

  constructor(_ctx: ExtensionContext, _env: Record<string, unknown>) {}

  async onBatch({ messages }: BatchRequest) {
    let changed = false;

    for (const msg of messages) {
      if (msg.type !== "agent.status") continue;
      const content = msg.content as { status?: unknown } | null;
      const status = content?.status;
      if (typeof status !== "string") continue;
      if (status === this.#currentStatus) continue;
      this.#currentStatus = status;
      changed = true;
    }

    if (!changed) return;

    return {
      snapshotDirty: true,
      // Live clients read updates via on("message"); late-joiners use onSnapshot/ext.
      broadcasts: [
        {
          type: "agent.status",
          content: { status: this.#currentStatus },
        },
      ],
    };
  }

  async onSnapshot() {
    return { snapshot: { status: this.#currentStatus } };
  }
}

export default defineExtension(AgentState);

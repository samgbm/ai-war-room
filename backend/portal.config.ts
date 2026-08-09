import { defineConfig } from "@portalsdk/config";

export default defineConfig({
  channels: {
    "war-room-*": {
      anonymous: true,
      extensions: {
        agentState: "./extensions/agentState.ts",
      },
      notify: (ctx) => {
        const mentions = ctx.message.mentions ?? [];
        if (mentions.length === 0) return null;
        return {
          title: "Agent Tagged You",
          data: { text: (ctx.message.content as { text?: string })?.text },
          to: mentions.map((m) => m.userId),
        };
      },
    },
  },
});

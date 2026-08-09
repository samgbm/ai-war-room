import { defineConfig } from "@portalsdk/config";

export default defineConfig({
  channels: {
    "war-room-*": {
      anonymous: true,
    },
  },
});

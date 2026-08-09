import { Portal } from "@portalsdk/core";

const apiKey = process.env.NEXT_PUBLIC_PORTAL_KEY;

if (!apiKey) {
  console.warn(
    "[ai-war-room] NEXT_PUBLIC_PORTAL_KEY is missing — realtime will stay disconnected.",
  );
}

/** Module-scope client: construction is sync/passive until a hook mounts. */
export const portal = new Portal({
  apiKey: apiKey ?? "pk_missing",
});

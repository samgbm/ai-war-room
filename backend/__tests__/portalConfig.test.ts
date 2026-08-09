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
  });
});

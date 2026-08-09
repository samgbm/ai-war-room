import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { audioCache } from "../src/audioCache.js";
import { createApp } from "../src/app.js";

describe("GET /api/audio/:id", () => {
  beforeEach(() => {
    audioCache.clear();
  });

  it("returns mpeg audio when the id is cached", async () => {
    const bytes = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    audioCache.set("clip-1", bytes);

    const response = await request(createApp()).get("/api/audio/clip-1");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/audio\/mpeg/);
    expect(Buffer.from(response.body)).toEqual(bytes);
  });

  it("returns 404 when the id is missing", async () => {
    const response = await request(createApp()).get("/api/audio/missing");

    expect(response.status).toBe(404);
    expect(response.text).toBe("Not found");
  });
});

import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 with the expected JSON shape", async () => {
    const app = createApp();

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      portal: "pending",
      ai: "pending",
    });
    expect(typeof response.body.timestamp).toBe("number");
  });
});

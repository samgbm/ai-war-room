import express from "express";
import { audioCache } from "./audioCache.js";

export function createApp() {
  const app = express();

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      portal: "pending",
      ai: "pending",
      timestamp: Date.now(),
    });
  });

  app.get("/api/audio/:id", (req, res) => {
    const audio = audioCache.get(req.params.id);
    if (!audio) return res.status(404).send("Not found");
    res.set("Content-Type", "audio/mpeg");
    res.send(audio);
  });

  return app;
}

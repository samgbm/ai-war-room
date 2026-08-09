import express from "express";

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

  return app;
}

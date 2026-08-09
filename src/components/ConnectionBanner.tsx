"use client";

import { AlertTriangle } from "lucide-react";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "ready"
  | "reconnecting"
  | "degraded"
  | "degraded-http"
  | "blocked";

type ConnectionBannerProps = {
  status: ConnectionStatus;
};

export function ConnectionBanner({ status }: ConnectionBannerProps) {
  if (status === "ready") return null;

  if (status === "reconnecting") {
    return (
      <div
        data-testid="connection-banner"
        role="status"
        className="flex items-center gap-2 border-b border-amber-500 bg-amber-900/50 px-4 py-2 text-amber-500 animate-pulse"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <p className="font-mono text-xs font-medium">
          Network anomaly detected. Reestablishing secure link...
        </p>
      </div>
    );
  }

  if (status === "degraded" || status === "degraded-http") {
    return (
      <div
        data-testid="connection-banner"
        role="status"
        className="flex items-center gap-2 border-b border-yellow-500 bg-yellow-900/40 px-4 py-2 text-yellow-400"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <p className="font-mono text-xs font-medium">
          WebSocket degraded. Falling back to HTTP polling. Expect higher
          latency.
        </p>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div
        data-testid="connection-banner"
        role="alert"
        className="flex items-center gap-2 border-b border-red-500 bg-red-900/50 px-4 py-2 text-red-400"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <p className="font-mono text-xs font-medium">
          Connection Blocked: Invalid Credentials or Rate Limit Exceeded.
        </p>
      </div>
    );
  }

  // idle / connecting — no banner noise during normal startup
  return null;
}

import { Portal } from "@portalsdk/core";

/**
 * Server-side Portal client for AI agents.
 * Uses the publishable key; PORTAL_SECRET stays CLI/deploy-only.
 */
export const portal = new Portal({
  apiKey: process.env.NEXT_PUBLIC_PORTAL_KEY || "pk_fallback",
});

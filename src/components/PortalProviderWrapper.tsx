"use client";

import { Portal } from "@portalsdk/core";
import { PortalProvider } from "@portalsdk/react";
import type { ReactNode } from "react";

// Construct once at module scope — sync/passive until a channel hook mounts.
// No `token` prop → Anonymous Mode (Portal mints a real anon JWT).
// A plain string like "demo-human-operator" is not a JWT and causes publish rejections.
const portal = new Portal({
  apiKey: process.env.NEXT_PUBLIC_PORTAL_KEY || "pk_fallback",
});

export function PortalProviderWrapper({ children }: { children: ReactNode }) {
  return <PortalProvider client={portal}>{children}</PortalProvider>;
}

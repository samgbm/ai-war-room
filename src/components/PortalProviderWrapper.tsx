"use client";

import { Portal } from "@portalsdk/core";
import { PortalProvider } from "@portalsdk/react";
import type { ReactNode } from "react";

// Construct once at module scope — sync/passive until a channel hook mounts.
const portal = new Portal({
  apiKey: process.env.NEXT_PUBLIC_PORTAL_KEY || "pk_fallback",
});

export function PortalProviderWrapper({ children }: { children: ReactNode }) {
  // Mock identity so inbox notifications can persist for this operator.
  return (
    <PortalProvider client={portal} token={() => "demo-human-operator"}>
      {children}
    </PortalProvider>
  );
}

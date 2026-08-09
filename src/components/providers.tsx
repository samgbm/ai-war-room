"use client";

import { PortalProvider } from "@portalsdk/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { portal } from "@/lib/portal";
import { THEMES } from "@/lib/themes";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="command"
      enableSystem
      themes={[...THEMES]}
      disableTransitionOnChange
      storageKey="ai-war-room-theme"
    >
      <PortalProvider client={portal}>{children}</PortalProvider>
    </ThemeProvider>
  );
}

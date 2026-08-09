"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { THEMES } from "@/lib/themes";

/** ThemeProvider shell from the previous increment — Portal nests inside this in layout. */
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
      {children}
    </ThemeProvider>
  );
}

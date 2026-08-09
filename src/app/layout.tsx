import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { PortalProviderWrapper } from "@/components/PortalProviderWrapper";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AI War Room",
  description:
    "Realtime multiplayer ops command center powered by Portal — live channels, presence, and AI agents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <PortalProviderWrapper>{children}</PortalProviderWrapper>
        </Providers>
      </body>
    </html>
  );
}

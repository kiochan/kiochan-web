import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavigationProgress } from "@/components/navigation-progress";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { profile } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kiochan.one"),
  title: {
    default: "Kiochan — Projects, experiments & notes",
    template: "%s — Kiochan",
  },
  description: profile.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Kiochan",
    locale: "en_US",
    description: profile.description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NavigationProgress>
            <ScrollReveal />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-surface focus:p-4"
            >
              Skip to content
            </a>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <SiteFooter />
            </div>
          </NavigationProgress>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/layout/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sportx-2026.vercel.app"),
  title: {
    default: "SportX 2026 | Purva Riviera Championship",
    template: "%s | SportX 2026",
  },
  description:
    "The inter-house sports championship platform for Purva Riviera residents, houses, events, schedules, standings, and results.",
  keywords: [
    "SportX 2026",
    "Purva Riviera",
    "inter-house championship",
    "sports leaderboard",
  ],
  openGraph: {
    title: "SportX 2026 | Riviera's Pride",
    description: "Purva Riviera Inter-House Sports Championship.",
    images: ["/images/brand/sportx-2026-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

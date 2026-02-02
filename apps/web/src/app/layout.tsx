import { ConvexClientProvider } from "@fasttute/backend/react";
import { spaceGrotesk } from "@/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  authors: [{ name: "Amodh Dhakal" }],
  creator: "Amodh Dhakal",
  publisher: "Fasttute.dev",
  title:
    "Fasttute.dev | Stop Scrubbing. Start Learning. AI-Powered YouTube Learning",
  description:
    "Fasttute transforms passive YouTube tutorials into interactive, AI-powered learning environments. Efficiently learn complex technical topics from video – no more endless scrubbing, manual coding, or lost context. Search, code, and learn effectively.",
  keywords: [
    "Fasttute",
    "YouTube learning",
    "AI learning",
    "technical tutorials",
    "video learning",
    "code tutorials",
    "efficient learning",
    "developer tools",
    "online courses",
    "deep learning",
    "interactive video",
  ],
  openGraph: {
    locale: "en_US",
    type: "website",
    url: "https://fasttute.dev",
    siteName: "Fasttute.dev",
    title:
      "Fasttute.dev | Stop Scrubbing. Start Learning. AI-Powered YouTube Learning",
    description:
      "Fasttute transforms passive YouTube tutorials into interactive, AI-powered learning environments. Efficiently learn complex technical topics from video – no more endless scrubbing, manual coding, or lost context.",
    images: [
      {
        url: "https://fasttute.dev/favicon.ico",
        width: 600,
        height: 600,
        alt: "Fasttute.dev - AI-Powered Learning from YouTube",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="sV48WkDRuxTipH8HmoGm5D48JWPx0E9AV1tg9heklXg"
        />
      </head>
      <body
        className={`${spaceGrotesk.className} antialiased bg-black text-gray-300`}
      >
        <ConvexClientProvider
          convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}
          clerkPublishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}

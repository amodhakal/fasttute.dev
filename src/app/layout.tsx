import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ClerkLoaded } from "@clerk/clerk-react";

const font = Funnel_Display({
  weight: "variable",
});

export const metadata: Metadata = {
  title: "fasttute.dev",
  description: "Stop scrubbing. Start learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <ConvexClientProvider>
            {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}

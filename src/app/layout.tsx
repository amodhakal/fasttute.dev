import ConvexClientProvider from "@/components/ConvexClientProvider";
import { spaceGrotesk } from "@/fonts";
import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <meta
          name="google-site-verification"
          content="sV48WkDRuxTipH8HmoGm5D48JWPx0E9AV1tg9heklXg"
        />
      </head>
      <body
        className={`${spaceGrotesk.className} antialiased bg-black text-gray-300`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}

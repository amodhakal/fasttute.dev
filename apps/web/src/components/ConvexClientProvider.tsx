"use client";

import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
          {children}
          <SpeedInsights />
          <Analytics />
        </ClerkLoaded>
        <Toaster position="top-center" />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

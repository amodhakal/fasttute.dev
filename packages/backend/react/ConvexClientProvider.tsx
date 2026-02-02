"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

export function ConvexClientProvider({
  children,
  convexUrl,
  clerkPublishableKey,
}: {
  children: ReactNode;
  convexUrl: string;
  clerkPublishableKey: string;
}) {
  const convex = new ConvexReactClient(convexUrl);

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

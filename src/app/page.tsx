"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import { AccessCode } from "@/components/access-code";
import React, { useState, useEffect } from "react";

export default function DemoPage(): React.ReactNode {
  const [hasAccess, setHasAccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedAccess = window.localStorage.getItem("lg:chat:hasAccess");
    if (storedAccess === "true") {
      setHasAccess(true);
    }
  }, []);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  if (!hasAccess) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Toaster />
        <AccessCode onAccessGranted={() => setHasAccess(true)} />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ThreadProvider>
        <StreamProvider>
          <ArtifactProvider>
            <Thread />
          </ArtifactProvider>
        </StreamProvider>
      </ThreadProvider>
    </React.Suspense>
  );
}

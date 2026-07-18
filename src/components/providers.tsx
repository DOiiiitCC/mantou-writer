"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useStore } from "@/lib/store";

function CloudSync() {
  const syncCloud = useStore((s) => s.syncCloud);

  useEffect(() => {
    // Sync on mount — load data from cloud
    syncCloud();
    // Then sync every 30 seconds
    const interval = setInterval(syncCloud, 30_000);
    return () => clearInterval(interval);
  }, [syncCloud]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <CloudSync />
      {children}
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  );
}

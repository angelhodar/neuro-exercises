"use client";

import type React from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/hooks/use-confirm";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <Toaster />
        <TooltipProvider delayDuration={500}>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </TooltipProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

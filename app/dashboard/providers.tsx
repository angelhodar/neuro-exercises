"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/hooks/use-confirm";

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <Toaster />
        <TooltipProvider delayDuration={500}>
          <ConfirmProvider>{children}</ConfirmProvider>
        </TooltipProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

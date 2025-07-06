"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createOrConnectToSandbox, stopSandbox } from "@/app/actions/sandbox";
import { getLastCompletedGeneration } from "@/app/actions/generations";

export type SandboxStatus = 
  | {
      status: "running";
      sandboxUrl: string;
      sandboxId: string;
    }
  | {
      status: "paused";
      sandboxId: string;
    }
  | {
      status: "stopped";
    }
  | null;

interface SandboxContextType {
  sandboxStatus: SandboxStatus;
  isLoading: boolean;
  error: string | null;
  hasCompletedGeneration: boolean;
  initializeSandbox: () => Promise<void>;
  refreshSandbox: () => Promise<void>;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (!context) {
    throw new Error("useSandbox must be used within a SandboxProvider");
  }
  return context;
}

interface SandboxProviderProps {
  children: React.ReactNode;
  slug: string;
}

export function SandboxProvider({ children, slug }: SandboxProviderProps) {
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedGeneration, setHasCompletedGeneration] = useState(false);

  // Check if there's a completed generation
  const checkCompletedGeneration = useCallback(async () => {
    try {
      const lastGeneration = await getLastCompletedGeneration(slug);
      setHasCompletedGeneration(!!lastGeneration);
      return !!lastGeneration;
    } catch (error) {
      console.error("Error checking completed generation:", error);
      setHasCompletedGeneration(false);
      return false;
    }
  }, [slug]);

  // Initialize or connect to sandbox
  const initializeSandbox = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hasGeneration = await checkCompletedGeneration();
      if (!hasGeneration) {
        setSandboxStatus({ status: "stopped" });
        return;
      }

      const result = await createOrConnectToSandbox(slug);
      
      if (result.status === "running") {
        setSandboxStatus({
          status: "running",
          sandboxUrl: result.sandboxUrl,
          sandboxId: result.sandboxId,
        });
      } else if (result.status === "paused") {
        setSandboxStatus({
          status: "paused",
          sandboxId: result.sandboxId,
        });
      } else {
        setSandboxStatus({ status: "stopped" });
      }
    } catch (error) {
      console.error("Error initializing sandbox:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize sandbox");
      setSandboxStatus({ status: "stopped" });
    } finally {
      setIsLoading(false);
    }
  }, [slug, isLoading, checkCompletedGeneration]);

  // Refresh sandbox (mainly for after chat completion)
  const refreshSandbox = useCallback(async () => {
    await initializeSandbox();
  }, [initializeSandbox]);

  // Initialize on mount
  useEffect(() => {
    initializeSandbox();
  }, [initializeSandbox]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop sandbox when component unmounts
      if (sandboxStatus?.status === "running" || sandboxStatus?.status === "paused") {
        stopSandbox(slug).catch(console.error);
      }
    };
  }, [slug, sandboxStatus]);

  const value: SandboxContextType = {
    sandboxStatus,
    isLoading,
    error,
    hasCompletedGeneration,
    initializeSandbox,
    refreshSandbox,
  };

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  );
} 
"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createOrConnectToSandbox, stopSandbox } from "@/app/actions/sandbox";

interface SandboxContextType {
  sandboxUrl: string | null;
  isLoading: boolean;
  error: string | null;
  initializeSandbox: () => Promise<void>;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function useSandbox() {
  const context = useContext(SandboxContext);

  if (!context) {
    throw new Error("useSandbox must be used within a SandboxProvider");
  }

  return context;
}

interface SandboxProviderProps extends PropsWithChildren {
  children: React.ReactNode;
  exerciseId: number;
}

export function SandboxProvider({
  children,
  exerciseId,
}: SandboxProviderProps) {
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or connect to sandbox
  const initializeSandbox = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrConnectToSandbox(exerciseId);
      setSandboxUrl(result.sandboxUrl);
    } catch (error) {
      console.error("Error initializing sandbox:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize sandbox"
      );
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, isLoading]);

  // Initialize on mount
  useEffect(() => {
    initializeSandbox();

    return () => {
      // Stop sandbox when component unmounts
      if (sandboxUrl) {
        stopSandbox(exerciseId).catch(console.error);
      }
    };
  }, [exerciseId, initializeSandbox, sandboxUrl]);

  const value: SandboxContextType = {
    sandboxUrl,
    isLoading,
    error,
    initializeSandbox,
  };

  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}

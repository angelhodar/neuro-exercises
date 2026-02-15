"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { initializeExercisePreview } from "@/app/actions/sandbox";

interface SandboxContextType {
  sandboxUrl: string | null;
  isLoading: boolean;
  error: string | null;
  initializePreview: () => Promise<void>;
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
  const [gen] = useQueryState("gen", parseAsInteger);
  const prevGen = useRef(gen);

  const initializePreview = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await initializeExercisePreview(exerciseId, gen);
      setSandboxUrl(result.sandboxUrl);
    } catch (error) {
      console.error("Error initializing preview:", error);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la previsualización"
      );
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, gen, isLoading]);

  // Auto-trigger preview when the gen query param changes
  useEffect(() => {
    if (gen !== prevGen.current) {
      prevGen.current = gen;
      initializePreview();
    }
  }, [gen, initializePreview]);

  const value: SandboxContextType = {
    sandboxUrl,
    isLoading,
    error,
    initializePreview,
  };

  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}

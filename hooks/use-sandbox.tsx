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
  error: string | null;
  initializePreview: () => Promise<void>;
  isLoading: boolean;
  sandboxUrl: string | null;
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
  exerciseId: number;
  hasCompletedGeneration?: boolean;
}

export function SandboxProvider({
  children,
  exerciseId,
  hasCompletedGeneration = false,
}: SandboxProviderProps) {
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gen] = useQueryState("gen", parseAsInteger);
  const prevGen = useRef<number | null | undefined>(undefined);

  const initializePreview = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await initializeExercisePreview(exerciseId, gen);
      setSandboxUrl(result.sandboxUrl);
    } catch (previewError) {
      console.error("Error initializing preview:", previewError);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "No se pudo iniciar la previsualización"
      );
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, gen, isLoading]);

  // Auto-initialize on mount if there's a completed generation,
  // and re-initialize when the gen query param changes
  useEffect(() => {
    if (prevGen.current === undefined) {
      prevGen.current = gen;
      if (hasCompletedGeneration) {
        initializePreview();
      }
      return;
    }

    if (gen !== prevGen.current) {
      prevGen.current = gen;
      initializePreview();
    }
  }, [gen, hasCompletedGeneration, initializePreview]);

  const value: SandboxContextType = {
    error,
    initializePreview,
    isLoading,
    sandboxUrl,
  };

  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}

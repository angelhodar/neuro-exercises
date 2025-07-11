"use client";

import { useEffect, useState } from "react";
import { loadClientAssets, type ClientAssets } from "@/app/exercises/loader";

export type { ClientAssets };

export function useExerciseAssetsLoader(slug: string) {
  const [assets, setAssets] = useState<ClientAssets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    loadClientAssets(slug)
      .then((loadedAssets) => {
        if (loadedAssets) {
          setAssets(loadedAssets);
        } else {
          setError(`Failed to load assets for exercise: ${slug}`);
        }
      })
      .catch((err) => {
        setError(`Error loading assets: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  return {
    assets,
    isLoading,
    error,
  };
} 
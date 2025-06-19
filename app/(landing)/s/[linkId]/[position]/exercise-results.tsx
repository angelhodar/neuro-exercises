"use client";

import { useEffect, useState } from "react";
import { useExerciseExecution } from "@/contexts/exercise-context";

interface ExerciseResultsCollectorProps {
  exerciseItemId: number;
}

export function ExerciseResultsCollector({ exerciseItemId }: ExerciseResultsCollectorProps) {
  const [sent, setSent] = useState(false);
  const { exerciseState, results } = useExerciseExecution();

  useEffect(() => {
    if (
      exerciseState === "finished" &&
      results.length > 0 &&
      exerciseItemId &&
      !sent
    ) {
      fetch("/api/exercise-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseItemId, results }),
      }).then(() => setSent(true));
    }
  }, [exerciseState, results, exerciseItemId, sent]);

  return null;
} 
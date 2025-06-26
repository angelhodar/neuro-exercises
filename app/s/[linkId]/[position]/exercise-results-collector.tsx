"use client";

import { useEffect, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { saveExerciseResults } from "@/app/actions/links";

interface ExerciseResultsCollectorProps {
  linkId: number;
  itemId: number;
}

export function ExerciseResultsCollector({
  linkId,
  itemId,
}: ExerciseResultsCollectorProps) {
  const [sent, setSent] = useState(false);
  const { exerciseState, results } = useExerciseExecution();

  useEffect(() => {
    if (exerciseState === "finished" && results.length > 0 && itemId && !sent) {
      console.log({ linkId, itemId, results });
      saveExerciseResults(linkId, itemId, results)
        .then(() => setSent(true))
        .catch((e) => console.error(e));
    }
  }, [exerciseState, results, itemId, sent]);

  return null;
}

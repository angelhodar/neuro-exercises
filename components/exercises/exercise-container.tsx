"use client";

import { PropsWithChildren } from "react";
import { Card } from "@/components/ui/card";
import { CountdownDisplay } from "./exercise-countdown";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { ExercisePresentation } from "./exercise-presentation";
import { useCountdown } from "./exercise-countdown";
import FloatingBottomBar from "./exercise-floating-bar";

export function ExerciseContainer({ children }: PropsWithChildren) {
  const { exerciseState } = useExerciseExecution();
  const { countdown } = useCountdown();

  return (
    <Card className="relative flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-full">
      {exerciseState === "ready" && !countdown ? (
        <ExercisePresentation />
      ) : (
        <CountdownDisplay>{children}</CountdownDisplay>
      )}
      <FloatingBottomBar />
    </Card>
  );
}

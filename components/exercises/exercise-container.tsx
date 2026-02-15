"use client";

import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/card";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { CountdownDisplay, useCountdown } from "./exercise-countdown";
import FloatingBottomBar from "./exercise-floating-bar";
import { ExercisePresentation } from "./exercise-presentation";

export function ExerciseContainer({ children }: PropsWithChildren) {
  const { exerciseState } = useExerciseExecution();
  const { countdown } = useCountdown();

  return (
    <Card className="relative flex h-full flex-1 items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50">
      {exerciseState === "ready" && !countdown ? (
        <ExercisePresentation />
      ) : (
        <CountdownDisplay>{children}</CountdownDisplay>
      )}
      <FloatingBottomBar />
    </Card>
  );
}

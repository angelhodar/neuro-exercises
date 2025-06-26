import { PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownDisplay } from "./exercise-countdown";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { ExercisePresentation } from "./exercise-presentation";
import { useCountdown } from "./exercise-countdown";

export function ExerciseContainer({ children }: PropsWithChildren) {
  const { exerciseState } = useExerciseExecution();
  const { countdown } = useCountdown();

  return (
    <Card className="mb-4 shadow-lg flex-1 flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative h-full">
          {exerciseState === "ready" && !countdown ? (
            <ExercisePresentation />
          ) : (
            <CountdownDisplay>{children}</CountdownDisplay>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

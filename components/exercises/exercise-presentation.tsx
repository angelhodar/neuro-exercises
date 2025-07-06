"use client";

import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createBlobUrl } from "@/lib/utils";
import { Play } from "lucide-react";
import { useCountdown } from "./exercise-countdown";

export function ExercisePresentation() {
  const { exercise } = useExerciseExecution();
  const { startCountdown } = useCountdown();

  return (
    <div className="text-center max-w-md mx-auto">
      {exercise.thumbnailUrl && (
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <img
            src={createBlobUrl(exercise.thumbnailUrl) || "/placeholder.svg"}
            alt={exercise.displayName}
            className="w-16 h-16 object-cover rounded-full"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-700 mb-4">
        {exercise.displayName}
      </h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        {exercise.description}
      </p>

      <Button
        size="lg"
        onClick={startCountdown}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
      >
        <Play className="w-6 h-6 mr-3" />
        Empezar
      </Button>
    </div>
  );
}

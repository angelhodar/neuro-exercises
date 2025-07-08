"use client";

import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createMediaUrl } from "@/lib/utils";
import { Play } from "lucide-react";
import { useCountdown } from "./exercise-countdown";
import { ExerciseAudioButton } from "./exercise-audio-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ExercisePresentation() {
  const { exercise } = useExerciseExecution();
  const { startCountdown } = useCountdown();

  return (
    <div className="text-center max-w-md mx-auto">
      {exercise.thumbnailUrl && (
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <img
            src={createMediaUrl(exercise.thumbnailUrl) || "/placeholder.svg"}
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

      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={startCountdown}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          <Play className="w-6 h-6 mr-2" />
          Empezar
        </Button>

        {exercise.audioInstructions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <ExerciseAudioButton
                audioSrc={createMediaUrl(exercise.audioInstructions)}
              />
            </TooltipTrigger>
            <TooltipContent>Escuchar instrucciones</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

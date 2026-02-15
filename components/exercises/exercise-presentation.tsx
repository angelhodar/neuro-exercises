"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createBlobUrl } from "@/lib/utils";
import { ExerciseAudioButton } from "./exercise-audio-button";
import { useCountdown } from "./exercise-countdown";

export function ExercisePresentation() {
  const { exercise } = useExerciseExecution();
  const { startCountdown } = useCountdown();

  return (
    <div className="mx-auto max-w-md text-center">
      {exercise.thumbnailUrl && (
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
          {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
          <img
            alt={exercise.displayName}
            className="h-16 w-16 rounded-full object-cover"
            height={64}
            src={createBlobUrl(exercise.thumbnailUrl) || "/placeholder.svg"}
            width={64}
          />
        </div>
      )}

      <h1 className="mb-4 font-bold text-4xl text-gray-700">
        {exercise.displayName}
      </h1>
      <p className="mb-8 text-gray-600 text-lg leading-relaxed">
        {exercise.description}
      </p>

      <div className="flex items-center justify-center gap-4">
        <Button
          className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
          onClick={startCountdown}
          size="lg"
        >
          <Play className="mr-2 h-6 w-6" />
          Empezar
        </Button>

        {exercise.audioInstructions && (
          <Tooltip>
            <TooltipTrigger
              render={
                <ExerciseAudioButton
                  audioSrc={createBlobUrl(exercise.audioInstructions)}
                />
              }
            />
            <TooltipContent>Escuchar instrucciones</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

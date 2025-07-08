"use client";

import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createBlobUrl } from "@/lib/utils";
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

  exercise.audioInstructions = "https://file-examples.com/storage/fe9a194958686838db9645f/2017/11/file_example_MP3_700KB.mp3";

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
                audioSrc={createBlobUrl(exercise.audioInstructions)}
              />
            </TooltipTrigger>
            <TooltipContent>Escuchar instrucciones</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

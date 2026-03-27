import type { Exercise, ExerciseChatGeneration } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";
import EditExerciseButton from "../edit-exercise";
import { GenerationHistory } from "./generation-history";
import { PublishButton } from "./publish-button";

interface ExerciseHeaderProps {
  exercise: Exercise;
  generations: ExerciseChatGeneration[];
}

export function ExerciseHeader({ exercise, generations }: ExerciseHeaderProps) {
  const hasCompletedGeneration = generations.some(
    (g) => g.status === "COMPLETED"
  );

  return (
    <div className="border-gray-200/50 border-b bg-white/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
            <img
              alt={exercise.displayName}
              className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
              height={56}
              src={
                createBlobUrl(exercise.thumbnailUrl || "") || "/placeholder.svg"
              }
              width={56}
            />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-lg">
              {exercise.displayName}
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <GenerationHistory generations={generations} />
          <PublishButton
            exercise={exercise}
            hasCompletedGeneration={hasCompletedGeneration}
          />
          <EditExerciseButton exercise={exercise} />
        </div>
      </div>
    </div>
  );
}

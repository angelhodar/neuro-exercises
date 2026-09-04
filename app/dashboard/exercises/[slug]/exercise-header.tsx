import type { Exercise, ExerciseChatGeneration } from "@/lib/db/schema";
import EditExerciseButton from "../edit-exercise";
import { GenerationHistory } from "./generation-history";

interface ExerciseHeaderProps {
  exercise: Exercise;
  generations: ExerciseChatGeneration[];
}

export function ExerciseHeader({ exercise, generations }: ExerciseHeaderProps) {
  return (
    <div className="bg-white/50 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate font-semibold text-gray-900 text-lg">
          {exercise.displayName}
        </h2>
        <div className="flex items-center space-x-3">
          <GenerationHistory generations={generations} />
          <EditExerciseButton exercise={exercise} />
        </div>
      </div>
    </div>
  );
}

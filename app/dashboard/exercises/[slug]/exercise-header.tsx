import { createBlobUrl } from "@/lib/utils";
import EditExerciseButton from "../edit-exercise";
import type { Exercise } from "@/lib/db/schema";

interface ExerciseHeaderProps {
  exercise: Exercise;
}

export function ExerciseHeader({ exercise }: ExerciseHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={
                createBlobUrl(exercise.thumbnailUrl || "") ||
                "/placeholder.svg"
              }
              alt={exercise.displayName}
              className="w-14 h-14 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-lg">
              {exercise.displayName}
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <EditExerciseButton exercise={exercise} />
        </div>
      </div>
    </div>
  );
} 
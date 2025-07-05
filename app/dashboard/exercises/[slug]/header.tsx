"use client";

import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/lib/db/schema";
import { createMediaUrl } from "@/lib/utils";
import EditExerciseButton from "../edit-exercise";

interface ExerciseHeaderProps {
  exercise: Exercise;
}

export function ExerciseHeader({ exercise }: ExerciseHeaderProps) {
  const { displayName, thumbnailUrl, tags } = exercise;

  return (
    <div className="p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={createMediaUrl(thumbnailUrl || "") || "/placeholder.svg"}
              alt={displayName}
              className="w-14 h-14 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-lg">
              {displayName}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-blue-25 text-blue-600 border-blue-100"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <EditExerciseButton exercise={exercise} />
      </div>
    </div>
  );
}

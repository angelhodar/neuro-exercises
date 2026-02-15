"use client";

import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";
import EditExerciseButton from "../edit-exercise";

interface ExerciseHeaderProps {
  exercise: Exercise;
}

export function ExerciseHeader({ exercise }: ExerciseHeaderProps) {
  const { displayName, thumbnailUrl, tags } = exercise;

  return (
    <div className="border-gray-200/50 border-b bg-white/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
            <img
              alt={displayName}
              className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
              height={56}
              src={createBlobUrl(thumbnailUrl || "") || "/placeholder.svg"}
              width={56}
            />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-lg">
              {displayName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  className="border-blue-100 bg-blue-25 px-2 py-1 text-blue-600 text-xs"
                  key={tag}
                  variant="secondary"
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

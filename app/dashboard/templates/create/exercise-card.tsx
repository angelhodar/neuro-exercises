import type { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ExerciseCardProps extends PropsWithChildren {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise, children }: ExerciseCardProps) => {
  return (
    <Card className="relative cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{exercise.displayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video overflow-hidden rounded-md bg-muted">
          {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
          <img
            alt={exercise.displayName}
            className="h-full w-full object-cover"
            height={180}
            src={
              createBlobUrl(exercise.thumbnailUrl || "") || "/placeholder.svg"
            }
            width={320}
          />
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

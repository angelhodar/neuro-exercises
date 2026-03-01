import type { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ExerciseCardProps extends PropsWithChildren {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise, children }: ExerciseCardProps) => {
  return (
    <Card className="cursor-pointer gap-2 pt-0 pb-4 transition-shadow hover:shadow-md">
      <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
        {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
        <img
          alt={exercise.displayName}
          className="h-full w-full object-cover"
          height={180}
          src={createBlobUrl(exercise.thumbnailUrl || "") || "/placeholder.svg"}
          width={320}
        />
      </div>
      <CardHeader className="px-3">
        <CardTitle className="text-lg">{exercise.displayName}</CardTitle>
      </CardHeader>
      <CardContent className="px-3">{children}</CardContent>
    </Card>
  );
};

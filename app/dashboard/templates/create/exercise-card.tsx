import { PropsWithChildren } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ExerciseCardProps extends PropsWithChildren {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise, children }: ExerciseCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow relative ">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{exercise.displayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <img
            src={createBlobUrl(exercise.thumbnailUrl || "") || "/placeholder.svg"}
            alt={exercise.displayName}
            className="w-full h-full object-cover"
          />
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

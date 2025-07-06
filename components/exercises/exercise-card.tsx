import { Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl, cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { displayName, tags, thumbnailUrl } = exercise;

  return (
    <Card className="relative transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 border border-muted-foreground/10 rounded-2xl group-focus:ring-2 group-focus:ring-primary/40 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {displayName}
            </CardTitle>
            {tags && tags.length > 0 && (
              <Badge
                variant="outline"
                className="absolute top-4 right-4 capitalize w-fit"
              >
                {tags[0]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {thumbnailUrl ? (
          <div className="aspect-video overflow-hidden rounded-md bg-white flex items-center justify-center">
            <img
              src={createBlobUrl(thumbnailUrl) || "/placeholder.svg"}
              alt={`Thumbnail de ${displayName}`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center">
              <Play className="mx-auto h-8 w-8 text-primary/60" />
              <p className="mt-2 text-sm text-muted-foreground">
                Ejercicio interactivo
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

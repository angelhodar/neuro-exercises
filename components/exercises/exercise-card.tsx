import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { displayName, tags, thumbnailUrl } = exercise;

  return (
    <Card className="relative h-full cursor-pointer rounded-2xl border border-muted-foreground/10 transition-all hover:-translate-y-1 hover:shadow-2xl group-focus:ring-2 group-focus:ring-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg transition-colors group-hover:text-primary">
              {displayName}
            </CardTitle>
            {tags && tags.length > 0 && (
              <Badge
                className="absolute top-4 right-4 w-fit capitalize"
                variant="outline"
              >
                {tags[0]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {thumbnailUrl ? (
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-white">
            {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
            <img
              alt={`Thumbnail de ${displayName}`}
              className="h-full w-full object-cover"
              height={180}
              src={createBlobUrl(thumbnailUrl) || "/placeholder.svg"}
              width={320}
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center">
              <Play className="mx-auto h-8 w-8 text-primary/60" />
              <p className="mt-2 text-muted-foreground text-sm">
                Ejercicio interactivo
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

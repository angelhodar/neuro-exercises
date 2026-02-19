import { Play } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ExerciseCardProps extends PropsWithChildren {
  exercise: Exercise;
}

export default function ExerciseCard({
  exercise,
  children,
}: ExerciseCardProps) {
  const { displayName, thumbnailUrl } = exercise;

  return (
    <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg group-focus:ring-2 group-focus:ring-primary/40">
      {thumbnailUrl ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
          <img
            alt={`Thumbnail de ${displayName}`}
            className="aspect-video w-full object-cover"
            height={180}
            src={createBlobUrl(thumbnailUrl) || "/placeholder.svg"}
            width={320}
          />
        </>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center">
            <Play className="mx-auto h-8 w-8 text-primary/60" />
            <p className="mt-2 text-muted-foreground text-sm">
              Ejercicio interactivo
            </p>
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle>{displayName}</CardTitle>
      </CardHeader>
      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}

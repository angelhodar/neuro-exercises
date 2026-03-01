"use client";

import { Play } from "lucide-react";
import type React from "react";
import { createContext, useContext } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { cn, createBlobUrl } from "@/lib/utils";

interface ExerciseCardContextValue {
  exercise: Exercise;
}

const ExerciseCardContext = createContext<ExerciseCardContextValue | null>(
  null
);

function useExerciseCard() {
  const ctx = useContext(ExerciseCardContext);
  if (!ctx) {
    throw new Error(
      "ExerciseCard.* components must be used within ExerciseCard"
    );
  }
  return ctx;
}

type ExerciseCardProps = React.ComponentProps<typeof Card> & {
  exercise: Exercise;
};

function ExerciseCard({
  exercise,
  children,
  className,
  ...props
}: ExerciseCardProps) {
  return (
    <ExerciseCardContext value={{ exercise }}>
      <Card
        className={cn("gap-3 rounded-xl py-0", className)}
        data-slot="exercise-card"
        {...props}
      >
        {children}
      </Card>
    </ExerciseCardContext>
  );
}

interface ExerciseCardThumbnailProps {
  className?: string;
  children?: React.ReactNode;
}

function ExerciseCardThumbnail({
  className,
  children,
}: ExerciseCardThumbnailProps) {
  const { exercise } = useExerciseCard();
  const { displayName, thumbnailUrl } = exercise;

  if (children) {
    return (
      <div
        className={cn("w-full overflow-hidden", className)}
        data-slot="exercise-card-thumbnail"
      >
        {children}
      </div>
    );
  }

  if (thumbnailUrl) {
    return (
      <div
        className={cn("aspect-video w-full overflow-hidden", className)}
        data-slot="exercise-card-thumbnail"
      >
        {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from storage */}
        <img
          alt={`Thumbnail de ${displayName}`}
          className="h-full w-full object-cover"
          height={180}
          src={createBlobUrl(thumbnailUrl) || "/placeholder.svg"}
          width={320}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-video items-center justify-center bg-linear-to-br from-primary/10 to-primary/5",
        className
      )}
      data-slot="exercise-card-thumbnail"
    >
      <div className="text-center">
        <Play className="mx-auto h-8 w-8 text-primary/60" />
        <p className="mt-2 text-muted-foreground text-sm">
          Ejercicio interactivo
        </p>
      </div>
    </div>
  );
}

function ExerciseCardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { exercise } = useExerciseCard();

  return (
    <CardHeader className={cn("px-4", className)} {...props}>
      <CardTitle>{exercise.displayName}</CardTitle>
    </CardHeader>
  );
}

function ExerciseCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { exercise } = useExerciseCard();

  if (!exercise.description) {
    return null;
  }

  return (
    <CardContent className={cn("px-4", className)} {...props}>
      <p className="line-clamp-2 text-muted-foreground text-sm">
        {exercise.description}
      </p>
    </CardContent>
  );
}

function ExerciseCardActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <CardFooter className={cn("px-4 pb-4", className)} {...props} />;
}

export {
  ExerciseCard,
  ExerciseCardActions,
  ExerciseCardDescription,
  ExerciseCardThumbnail,
  ExerciseCardTitle,
};

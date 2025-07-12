import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Brain, Play } from "lucide-react";
import { Exercise } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface LinkExerciseCardProps {
  exercise: Exercise;
  completed: boolean;
  linkId: number;
  itemId: number;
}

export function LinkExerciseCard(props: LinkExerciseCardProps) {
  const { exercise, completed, linkId, itemId } = props;

  return (
    <Card
      className={cn(
        "transition-all",
        completed
          ? "bg-green-50 border-green-200"
          : "ring-2 ring-blue-500 shadow-lg"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "rounded-full p-3",
                completed ? "bg-green-100" : "bg-blue-100"
              )}
            >
              {completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Brain className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{exercise.displayName}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {exercise.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completed ? (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/exercises/${exercise.slug}/results?linkId=${linkId}&itemId=${itemId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Resultados
                </Link>
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                asChild
              >
                <Link href={`/exercises/${exercise.slug}?linkId=${linkId}&itemId=${itemId}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Comenzar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

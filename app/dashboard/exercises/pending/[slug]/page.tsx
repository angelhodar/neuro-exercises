import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getPRComments } from "@/app/actions/github";
import { PRChat } from "./pr-chat";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink, Eye } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PendingExercisePage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) return notFound();

  const comments = await getPRComments(slug);

  return (
    <div className="container w-full mx-auto p-2 flex flex-col gap-6 min-h-screen">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">
                  {exercise.displayName}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Última actualización:{" "}
                  {new Date(exercise.updatedAt).toLocaleString("es-ES", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {exercise.prNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Ejercicio
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en GitHub
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="flex-1">
        <PRChat slug={slug} comments={comments} />
      </div>
    </div>
  );
}

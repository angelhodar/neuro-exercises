import { notFound } from "next/navigation";
import Link from "next/link";
  import { Button } from "@/components/ui/button";
import { getExerciseLinkByPublicId } from "@/app/actions/links";
import { getExerciseFromServerRegistry } from "@/app/registry/registry.server";

interface PageProps {
  params: Promise<{ linkId: string; position: string }>;
}

export default async function ExerciseResultsPage({ params }: PageProps) {
  const { linkId, position } = await params;
  const pos = parseInt(position);

  const linkData = await getExerciseLinkByPublicId(linkId);

  if (!linkData) notFound();

  const item = linkData.template.exerciseTemplateItems[pos];

  if (!item) notFound();

  const { exercise, config, exerciseResults } = item;

  if (!exerciseResults) notFound();

  const exerciseEntry = getExerciseFromServerRegistry(exercise.slug);

  if (!exerciseEntry) notFound();

  const { ResultsComponent } = exerciseEntry;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Resultados de {exercise.displayName}</h1>
      <ResultsComponent results={exerciseResults} {...config} />
      <div className="mt-6 flex justify-center">
        <Button asChild>
          <Link href={`/s/${linkId}`}>
            Volver a la lista de ejercicios
          </Link>
        </Button>
      </div>
    </div>
  );
} 
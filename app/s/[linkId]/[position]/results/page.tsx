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
    <div className="flex flex-col container mx-auto items-center justify-center h-screen">
      <ResultsComponent results={exerciseResults[0].results} {...config} />
      <div className="mt-6 flex justify-center">
        <Button asChild>
          <Link href={`/s/${linkId}`}>Volver a la lista de ejercicios</Link>
        </Button>
      </div>
    </div>
  );
}

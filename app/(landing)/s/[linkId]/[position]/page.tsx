import { notFound } from "next/navigation";
import { getExerciseLinkByPublicId } from "@/app/actions/links";
import { getExerciseFromRegistry } from "@/app/registry/exercises";
import { ExerciseProvider } from "@/contexts/exercise-context";
import { ExerciseResultsCollector } from "./exercise-results";

interface PageProps {
  params: Promise<{ linkId: string; position: string }>;
}

export default async function ExercisePage({ params }: PageProps) {
  const { linkId, position } = await params;

  const pos = parseInt(position);

  const linkData = await getExerciseLinkByPublicId(linkId);

  if (!linkData) notFound();

  const item = linkData.exerciseLinkItems[pos];

  if (!item) notFound();

  const {exercise, config } = item;

  if (!config) notFound();

  const exerciseEntry = getExerciseFromRegistry(exercise.slug);

  if (!exerciseEntry) notFound();

  const { ExerciseComponent } = exerciseEntry;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{exercise.displayName}</h1>
      <p className="mb-6 text-gray-600">{exercise.description}</p>
      <ExerciseProvider totalQuestions={config.totalQuestions}>
        <ExerciseComponent config={config} />
        <ExerciseResultsCollector exerciseItemId={item.id} />
      </ExerciseProvider>
    </div>
  );
} 
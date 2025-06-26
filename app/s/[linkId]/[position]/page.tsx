import { notFound } from "next/navigation";
import { getExerciseLinkByPublicId } from "@/app/actions/links";
import { getExerciseFromServerRegistry } from "@/app/registry/registry.server";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseResultsCollector } from "./exercise-results-collector";
import ExerciseExecutionLayout from "@/components/exercises/exercise-execution-layout";

interface PageProps {
  params: Promise<{ linkId: string; position: string }>;
}

export default async function ExercisePage({ params }: PageProps) {
  const { linkId, position } = await params;

  const pos = parseInt(position);

  const linkData = await getExerciseLinkByPublicId(linkId);

  if (!linkData) notFound();

  const item = linkData.template.exerciseTemplateItems[pos];

  if (!item) notFound();

  const { exercise, config } = item;

  if (!config) notFound();

  const exerciseEntry = getExerciseFromServerRegistry(exercise.slug);

  if (!exerciseEntry) notFound();

  const { ExerciseComponent } = exerciseEntry;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 h-screen">
      <ExerciseProvider
        totalQuestions={config.totalQuestions}
        exercise={exercise}
      >
        <ExerciseExecutionLayout>
          <ExerciseComponent config={config} />
        </ExerciseExecutionLayout>
        <ExerciseResultsCollector linkId={linkData.id} itemId={item.id} />
      </ExerciseProvider>
    </div>
  );
}

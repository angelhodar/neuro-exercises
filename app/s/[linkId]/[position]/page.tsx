import { notFound } from "next/navigation";
import { getExerciseLinkByPublicId } from "@/app/actions/links";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseResultsCollector } from "./exercise-results-collector";
import { CountdownProvider } from "@/components/exercises/exercise-countdown";
import { ExerciseContainer } from "@/components/exercises/exercise-container";

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

  const entry = getExerciseFromRegistry(exercise.slug);

  if (!entry) notFound();

  const { ExerciseComponent } = entry;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 h-screen">
      <ExerciseProvider
        totalQuestions={config.totalQuestions}
        exercise={exercise}
      >
        <CountdownProvider>
          <ExerciseContainer>
            <ExerciseComponent config={config} />
          </ExerciseContainer>
        </CountdownProvider>
        <ExerciseResultsCollector linkId={linkData.id} itemId={item.id} />
      </ExerciseProvider>
    </div>
  );
}

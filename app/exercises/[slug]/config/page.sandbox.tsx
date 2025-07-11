import { notFound } from "next/navigation";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { loadExerciseAssets } from "@/app/exercises/loader";
import { getExerciseFromSandboxEnv } from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = getExerciseFromSandboxEnv();
  const assets = await loadExerciseAssets(slug);

  if (!assets || !exercise) notFound();

  const { ConfigFieldsComponent } = assets;

  return (
    <div className="flex flex-1 container justify-center items-center py-8 mx-auto min-h-full">
      <ExerciseConfigForm slug={slug} title={exercise.displayName}>
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    </div>
  );
}

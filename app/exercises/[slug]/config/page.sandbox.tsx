import { notFound } from "next/navigation";
import { loadExerciseAssets } from "@/app/exercises/loader";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseFromSandboxEnv } from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = getExerciseFromSandboxEnv();
  const assets = await loadExerciseAssets(slug);

  if (!(assets && exercise)) {
    notFound();
  }

  const { ConfigFieldsComponent } = assets;

  return (
    <div className="container mx-auto flex min-h-full flex-1 items-center justify-center py-8">
      <ExerciseConfigForm
        exerciseId={exercise.id}
        slug={slug}
        title={exercise.displayName}
      >
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    </div>
  );
}

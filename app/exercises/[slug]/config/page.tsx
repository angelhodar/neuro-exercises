import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { exerciseHasAssets } from "@/app/exercises/loader";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const [exercise, hasAssets] = await Promise.all([
    getExerciseBySlug(slug),
    exerciseHasAssets(slug),
  ]);

  if (!(exercise && hasAssets)) {
    notFound();
  }

  return (
    <div className="container mx-auto flex min-h-full flex-1 items-center justify-center py-8">
      <ExerciseConfigForm
        exerciseId={exercise.id}
        slug={slug}
        title={exercise.displayName}
      />
    </div>
  );
}

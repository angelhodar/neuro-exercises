import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getExercisePresets } from "@/app/actions/presets";
import { getCurrentUser } from "@/app/actions/users";
import { exerciseHasAssets } from "@/app/exercises/loader";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const [exercise, hasAssets, user] = await Promise.all([
    getExerciseBySlug(slug),
    exerciseHasAssets(slug),
    getCurrentUser(),
  ]);

  if (!(exercise && hasAssets)) {
    notFound();
  }

  const presets = user ? await getExercisePresets(exercise.id) : [];

  return (
    <div className="container mx-auto flex min-h-full flex-1 items-center justify-center py-8">
      <ExerciseConfigForm
        exerciseId={exercise.id}
        presets={presets}
        slug={slug}
        title={exercise.displayName}
      />
    </div>
  );
}

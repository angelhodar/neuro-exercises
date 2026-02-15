import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="container mx-auto flex min-h-full flex-1 items-center justify-center py-8">
      <ExerciseConfigForm slug={slug} title={exercise.displayName} />
    </div>
  );
}

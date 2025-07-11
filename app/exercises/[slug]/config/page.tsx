import { notFound } from "next/navigation";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseBySlug } from "@/app/actions/exercises";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  return (
    <div className="flex flex-1 container justify-center items-center py-8 mx-auto min-h-full">
      <ExerciseConfigForm slug={slug} title={exercise.displayName} />
    </div>
  );
}

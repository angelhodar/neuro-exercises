import { notFound } from "next/navigation";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseFromClientRegistry } from "@/app/registry/registry.client";
import { getExerciseBySlug } from "@/app/actions/exercises";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const exerciseClientEntry = getExerciseFromClientRegistry(slug);

  if (!exerciseClientEntry) notFound();

  const { ConfigFieldsComponent } = exerciseClientEntry;

  return (
    <ExerciseConfigForm slug={slug} title={exercise.displayName}>
      <ConfigFieldsComponent />
    </ExerciseConfigForm>
  );
}

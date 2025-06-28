import { notFound } from "next/navigation";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { getExerciseBySlug } from "@/app/actions/exercises";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const entry = getExerciseFromRegistry(slug);

  if (!entry) notFound();

  const { ConfigFieldsComponent } = entry;

  return (
    <div className="flex flex-1 container justify-center items-center mx-auto">
      <ExerciseConfigForm slug={slug} title={exercise.displayName}>
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    </div>
  );
}

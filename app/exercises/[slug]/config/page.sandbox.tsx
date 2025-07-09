import { notFound } from "next/navigation";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { getExerciseFromSandboxEnv } from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExerciseConfigPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = getExerciseFromSandboxEnv();
  const entry = getExerciseFromRegistry(slug);

  if (!entry || !exercise) notFound();

  const { ConfigFieldsComponent } = entry;

  return (
    <div className="flex flex-1 container justify-center items-center py-8 mx-auto min-h-full">
      <ExerciseConfigForm slug={slug} title={exercise.displayName}>
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    </div>
  );
}

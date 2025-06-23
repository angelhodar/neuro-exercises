import { notFound } from "next/navigation";
import { getExerciseFromRegistry } from "@/app/registry/exercises";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseControls } from "@/components/exercises/exercise-controls";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExerciseBySlug } from "@/app/actions/exercises";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { config: configString } = await searchParams;

  const exerciseDetails = getExerciseFromRegistry(slug);

  if (!exerciseDetails) notFound();

  const { schema, ConfigFieldsComponent, ExerciseComponent } = exerciseDetails;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const config = schema.safeParse(JSON.parse((configString as string) || "{}"));

  if (!config.success)
    return (
      <ExerciseConfigForm schema={schema} title={exercise.displayName}>
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    );

  const parsedConfig = config.data;

  return (
    <ExerciseProvider totalQuestions={parsedConfig.totalQuestions}>
      <ExerciseComponent config={parsedConfig} />
      <ExerciseControls />
    </ExerciseProvider>
  );
}

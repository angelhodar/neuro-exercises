import { notFound } from "next/navigation";
import { getExerciseFromServerRegistry } from "@/app/registry/registry.server";
import { getExerciseFromClientRegistry } from "@/app/registry/registry.client";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import ExerciseExecutionLayout from "@/components/exercises/exercise-execution-layout";
import { ExerciseConfigForm } from "@/components/exercises/exercise-config-form";
import { getExercises, getExerciseBySlug } from "@/app/actions/exercises";


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { config: configString } = await searchParams;

  const exerciseDetails = getExerciseFromServerRegistry(slug);
  const clientEntry = getExerciseFromClientRegistry(slug);

  if (!exerciseDetails || !clientEntry) notFound();

  const { schema, ExerciseComponent } = exerciseDetails;
  const { ConfigFieldsComponent } = clientEntry;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const config = schema.safeParse(JSON.parse((configString as string) || "{}"));

  if (!config.success)
    return (
      <ExerciseConfigForm slug={slug} title={exercise.displayName}>
        <ConfigFieldsComponent />
      </ExerciseConfigForm>
    );

  const parsedConfig = config.data;

  return (
    <ExerciseProvider
      totalQuestions={parsedConfig.totalQuestions}
      exercise={exercise}
    >
      <ExerciseExecutionLayout>
        <ExerciseComponent config={parsedConfig} />
      </ExerciseExecutionLayout>
    </ExerciseProvider>
  );
}

export async function generateStaticParams() {
  const exercises = await getExercises();
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

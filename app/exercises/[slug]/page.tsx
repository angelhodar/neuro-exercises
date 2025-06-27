import { notFound, redirect, RedirectType } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromServerRegistry } from "@/app/registry/registry.server";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import ExerciseExecutionLayout from "@/components/exercises/exercise-execution-layout";
import { getExercises, getExerciseBySlug } from "@/app/actions/exercises";
import { parseConfigFromSearchParams } from "./parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const exerciseDetails = getExerciseFromServerRegistry(slug);

  if (!exerciseDetails) notFound();

  const parsedConfig = parseConfigFromSearchParams(slug, resolvedSearchParams);

  if (!parsedConfig) {
    redirect(`/exercises/${slug}/config`, RedirectType.replace);
  }

  const { ExerciseComponent } = exerciseDetails;

  return (
    <ExerciseProvider
      {...parsedConfig}
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

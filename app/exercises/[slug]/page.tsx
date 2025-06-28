import { notFound, redirect, RedirectType } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseContainer } from "@/components/exercises/exercise-container";
import { CountdownProvider } from "@/components/exercises/exercise-countdown";
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

  const entry = getExerciseFromRegistry(slug);

  if (!entry) notFound();

  const parsedConfig = parseConfigFromSearchParams(slug, resolvedSearchParams);

  if (!parsedConfig) {
    redirect(`/exercises/${slug}/config`, RedirectType.replace);
  }

  const { ExerciseComponent } = entry;

  return (
    <ExerciseProvider {...parsedConfig} exercise={exercise}>
      <CountdownProvider>
        <ExerciseContainer>
          <ExerciseComponent config={parsedConfig} />
        </ExerciseContainer>
      </CountdownProvider>
    </ExerciseProvider>
  );
}

export async function generateStaticParams() {
  const exercises = await getExercises();
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

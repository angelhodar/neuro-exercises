import { notFound, redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseContainer } from "@/components/exercises/exercise-container";
import { CountdownProvider } from "@/components/exercises/exercise-countdown";
import { getExerciseBySlug, getExercises } from "@/app/actions/exercises";
import { parseConfigFromUrl, exerciseParamsSchema, getExerciseConfigFromLink } from "./parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const validationResult = exerciseParamsSchema.safeParse(resolvedSearchParams);

  const exercise = await getExerciseBySlug(slug);
  const entry = getExerciseFromRegistry(slug);

  if (!exercise || !entry) notFound();

  if (!validationResult.success) redirect(`/exercises/${slug}/config`);

  const { schema } = entry;

  const parsedParams = validationResult.data;

  const config = parsedParams.type === 'config'
    ? await parseConfigFromUrl(parsedParams.config, schema)
    : await getExerciseConfigFromLink(parsedParams.linkId, parsedParams.itemId);

  if (!config) redirect(`/exercises/${slug}/config`);

  const { ExerciseComponent } = entry;

  return (
    <ExerciseProvider {...config} exercise={exercise}>
      <CountdownProvider>
        <ExerciseContainer>
          <ExerciseComponent config={config} />
        </ExerciseContainer>
      </CountdownProvider>
    </ExerciseProvider>
  );
}

export async function generateStaticParams() {
  const exercises = await getExercises();
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

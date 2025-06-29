import { notFound } from "next/navigation";
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

  if (!validationResult.success) notFound();

  const exercise = await getExerciseBySlug(slug);
  const entry = getExerciseFromRegistry(slug);

  if (!exercise || !entry) notFound();

  const { schema } = entry;

  const { config: configString, linkId, itemId } = validationResult.data;

  const config = configString
    ? await parseConfigFromUrl(configString, schema)
    : await getExerciseConfigFromLink(linkId!, itemId!);

  if (!config) notFound();

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

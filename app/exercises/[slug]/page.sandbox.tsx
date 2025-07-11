import { notFound, redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { loadExerciseAssets } from "@/app/exercises/loader";
import { ExerciseProvider } from "@/hooks/use-exercise-execution";
import { ExerciseContainer } from "@/components/exercises/exercise-container";
import { CountdownProvider } from "@/components/exercises/exercise-countdown";
import { parseConfigFromUrl, exerciseParamsSchema, getExerciseFromSandboxEnv } from "./parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const validationResult = exerciseParamsSchema.safeParse(resolvedSearchParams);

  const exercise = getExerciseFromSandboxEnv();
  const entry = await loadExerciseAssets(slug);

  if (!exercise || !entry) notFound();

  if (!validationResult.success) redirect(`/exercises/${slug}/config`);

  const { configSchema } = entry;

  const parsedParams = validationResult.data;

  if (parsedParams.type !== "config") redirect(`/exercises/${slug}/config`);

  const config = parseConfigFromUrl(parsedParams.config, configSchema);

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

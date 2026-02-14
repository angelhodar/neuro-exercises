import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "nuqs/server";
import { loadExerciseAssets } from "@/app/exercises/loader";
import {
  parseConfigFromUrl,
  parseResultsFromUrl,
  exerciseResultsParamsSchema,
  getExerciseFromSandboxEnv,
} from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function ExerciseResultsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const validationResult =
    exerciseResultsParamsSchema.safeParse(resolvedSearchParams);

  if (!validationResult.success) notFound();

  const exercise = getExerciseFromSandboxEnv();
  const entry = await loadExerciseAssets(slug);

  if (!exercise || !entry) notFound();

  const { configSchema, resultSchema } = entry;
  const parsedParams = validationResult.data;

  if (parsedParams.type !== "config") notFound();

  const config = parseConfigFromUrl(parsedParams.config, configSchema);
  const results = parseResultsFromUrl(parsedParams.results, resultSchema);

  const { ResultsComponent } = entry;

  return (
    <div className="flex flex-col container mx-auto items-center justify-center h-screen">
      <ResultsComponent results={results} config={config} />
      <div className="mt-6 flex justify-center">
        <Button render={<Link href={`/exercises/${slug}/config`} />}>
            Volver a la configuración
        </Button>
      </div>
    </div>
  );
}

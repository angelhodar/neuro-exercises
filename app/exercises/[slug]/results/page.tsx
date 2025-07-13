import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "nuqs/server";
import { loadExerciseAssets } from "@/app/exercises/loader";
import { getExerciseBySlug } from "@/app/actions/exercises";
import {
  parseConfigFromUrl,
  parseResultsFromUrl,
  exerciseResultsParamsSchema,
} from "../parsers";
import { getResultsById } from "@/app/actions/results";

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

  const exercise = await getExerciseBySlug(slug);
  const assets = await loadExerciseAssets(slug);

  if (!exercise || !assets) notFound();

  const { configSchema, resultSchema } = assets;
  const parsedParams = validationResult.data;

  let config,
    results,
    backUrl = `/exercises/${slug}`;

  if (parsedParams.type === "config") {
    // Caso 1: config + results en URL
    config = parseConfigFromUrl(parsedParams.config, configSchema);
    results = parseResultsFromUrl(parsedParams.results, resultSchema);
  } else {
    // Caso 2: rid (result ID)
    const resultData = await getResultsById(parsedParams.rid);

    if (!resultData) notFound();

    config = resultData.config;
    results = resultData.results;
    backUrl = resultData.backUrl;
  }

  if (!config || !results) notFound();

  console.log(results)

  const { ResultsComponent } = assets;

  return (
    <div className="flex flex-col container mx-auto items-center justify-center h-screen">
      <ResultsComponent results={results} config={config} />
      {parsedParams.type === "result" && (
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href={backUrl}>Volver a la lista de ejercicios</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

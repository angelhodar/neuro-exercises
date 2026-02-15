import Link from "next/link";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getResultsById } from "@/app/actions/results";
import { loadExerciseAssets } from "@/app/exercises/loader";
import { Button } from "@/components/ui/button";
import {
  exerciseResultsParamsSchema,
  parseConfigFromUrl,
  parseResultsFromUrl,
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

  if (!validationResult.success) {
    notFound();
  }

  const exercise = await getExerciseBySlug(slug);
  const assets = await loadExerciseAssets(slug);

  if (!(exercise && assets)) {
    notFound();
  }

  const { configSchema, resultSchema } = assets;
  const parsedParams = validationResult.data;

  let config: unknown;
  let results: unknown;
  let backUrl = `/exercises/${slug}`;

  if (parsedParams.type === "config") {
    // Caso 1: config + results en URL
    config = parseConfigFromUrl(parsedParams.config, configSchema);
    results = parseResultsFromUrl(parsedParams.results, resultSchema);
  } else {
    // Caso 2: rid (result ID)
    const resultData = await getResultsById(parsedParams.rid);

    if (!resultData) {
      notFound();
    }

    config = resultData.config;
    results = resultData.results;
    backUrl = resultData.backUrl;
  }

  if (!(config && results)) {
    notFound();
  }

  const { ResultsComponent } = assets;

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center">
      <ResultsComponent config={config} results={results} />
      {parsedParams.type === "result" && (
        <div className="mt-6 flex justify-center">
          <Button render={<Link href={backUrl} />}>
            Volver a la lista de ejercicios
          </Button>
        </div>
      )}
    </div>
  );
}

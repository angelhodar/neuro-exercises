import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
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
  const entry = getExerciseFromRegistry(slug);

  if (!exercise || !entry) notFound();

  const { schema, resultsSchema } = entry;
  const parsedParams = validationResult.data;

  if (parsedParams.type !== "config") notFound();

  const config = parseConfigFromUrl(parsedParams.config, schema);
  const results = parseResultsFromUrl(parsedParams.results, resultsSchema);

  const { ResultsComponent } = entry;

  return (
    <div className="flex flex-col container mx-auto items-center justify-center h-screen">
      <ResultsComponent results={results} config={config} />
      <div className="mt-6 flex justify-center">
        <Button asChild>
          <Link href={`/exercises/${slug}/config`}>
            Volver a la configuración
          </Link>
        </Button>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { 
  parseConfigFromUrl, 
  parseResultsFromUrl, 
  exerciseResultsParamsSchema, 
  getExerciseResultsFromLink 
} from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function ExerciseResultsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const validationResult = exerciseResultsParamsSchema.safeParse(resolvedSearchParams);

  if (!validationResult.success) notFound();

  const exercise = await getExerciseBySlug(slug);
  const entry = getExerciseFromRegistry(slug);

  if (!exercise || !entry) notFound();

  const { schema } = entry;

  const { config: configString, results: resultsString, linkId, itemId } = validationResult.data;

  let config, results, isFromLink = false, backUrl = "";

  if (configString && resultsString) {
    // Caso 1: config + results en URL
    config = await parseConfigFromUrl(configString, schema);
    results = await parseResultsFromUrl(resultsString);
    isFromLink = false;
    backUrl = `/exercises/${slug}`;
  } else {
    // Caso 2: linkId + itemId
    const linkData = await getExerciseResultsFromLink(linkId!, itemId!);
    if (!linkData) notFound();
    
    config = linkData.config;
    results = linkData.results;
    isFromLink = true;
    backUrl = linkData.backUrl;
  }

  if (!config || !results) notFound();

  const { ResultsComponent } = entry;

  return (
    <div className="flex flex-col container mx-auto items-center justify-center h-screen">
      <ResultsComponent results={results} config={config} />
      {isFromLink && (
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href={backUrl}>Volver a la lista de ejercicios</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

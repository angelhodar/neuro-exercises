import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { parseConfigFromSearchParams, parseResultsFromSearchParams } from "../parsers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function ExerciseResultsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) notFound();

  const entry = getExerciseFromRegistry(slug);

  if (!entry) notFound();

  const { ResultsComponent } = entry;

  const results = parseResultsFromSearchParams(slug, resolvedSearchParams);
  const config = parseConfigFromSearchParams(slug, resolvedSearchParams);

  if (!results) notFound();

  return <ResultsComponent results={results} config={config} />
}

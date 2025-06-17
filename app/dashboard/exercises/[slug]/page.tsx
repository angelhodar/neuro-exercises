import { notFound } from "next/navigation"
import { getExerciseFromRegistry, exerciseRegistry } from "@/app/registry/exercises"
import { ExerciseRunner } from "@/components/exercises/exercise-runner"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DynamicExercisePage(props: PageProps) {
  const params = await props.params;

  if (!getExerciseFromRegistry(params.slug)) notFound()

  return <ExerciseRunner slug={params.slug} />
}

export async function generateStaticParams() {
  return Object.keys(exerciseRegistry).map((slug) => ({
    slug,
  }))
}
import { notFound } from "next/navigation"
import { getExerciseFromRegistry, exerciseRegistry } from "@/app/registry/exercises"
import { ExerciseRunner } from "@/components/exercise-runner"

export default async function DynamicExercisePage(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
  if (!getExerciseFromRegistry(params.slug)) notFound()

  return <ExerciseRunner slug={params.slug} />
}

export async function generateStaticParams() {
  return Object.keys(exerciseRegistry).map((slug) => ({
    slug,
  }))
}
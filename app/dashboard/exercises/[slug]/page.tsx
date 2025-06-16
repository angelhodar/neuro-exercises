import { notFound } from "next/navigation"
import { getExerciseFromRegistry, exerciseRegistry } from "@/app/registry/exercises"
import { ExerciseRunner } from "@/components/exercise-runner"

export default function DynamicExercisePage({
  params,
}: {
  params: { slug: string }
}) {
  if (!getExerciseFromRegistry(params.slug)) notFound()

  return <ExerciseRunner slug={params.slug} />
}

export async function generateStaticParams() {
  return Object.keys(exerciseRegistry).map((slug) => ({
    slug,
  }))
}
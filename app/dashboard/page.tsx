import Link from "next/link";
import ExerciseCard from "@/components/exercises/exercise-card";
import { getExercises } from "@/app/actions/exercises";
import EditExerciseButton from "./exercises/edit-exercise";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderActions,
} from "@/app/dashboard/dashboard-header";
import { exerciseHasAssets } from "@/app/exercises/loader";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getExercises();

  const exerciseAssetChecks = await Promise.all(
    exercises.map(async (exercise) => ({
      ...exercise,
      hasAssets: await exerciseHasAssets(exercise.slug),
    })),
  );

  return (
    <>
      <DashboardHeader>
        <DashboardHeaderTitle>Ejercicios</DashboardHeaderTitle>
        <DashboardHeaderActions>
          <Button asChild>
            <Link href="/dashboard/exercises/create">
              Crear nuevo ejercicio
            </Link>
          </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4">
        {exerciseAssetChecks.map((exercise) => (
          <div key={exercise.id} className="relative h-full">
            <Link
              href={
                exercise.hasAssets
                  ? `/exercises/${exercise.slug}`
                  : `/dashboard/exercises/${exercise.slug}`
              }
              className="block group focus:outline-none h-full"
            >
              <ExerciseCard exercise={exercise} />
            </Link>
            <div className="absolute bottom-2 right-2 z-10">
              <EditExerciseButton exercise={exercise} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

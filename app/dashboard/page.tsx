import Link from "next/link";
import { getExercises } from "@/app/actions/exercises";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { exerciseHasAssets } from "@/app/exercises/loader";
import ExerciseCard from "@/components/exercises/exercise-card";
import { Button } from "@/components/ui/button";
import EditExerciseButton from "./exercises/edit-exercise";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getExercises();

  const exerciseAssetChecks = await Promise.all(
    exercises.map(async (exercise) => ({
      ...exercise,
      hasAssets: await exerciseHasAssets(exercise.slug),
    }))
  );

  return (
    <>
      <DashboardHeader>
        <DashboardHeaderTitle>Ejercicios</DashboardHeaderTitle>
        <DashboardHeaderActions>
          <Button render={<Link href="/dashboard/exercises/create" />}>
            Crear nuevo ejercicio
          </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
        {exerciseAssetChecks.map((exercise) => (
          <div className="relative h-full" key={exercise.id}>
            <Link
              className="group block h-full focus:outline-none"
              href={
                exercise.hasAssets
                  ? `/exercises/${exercise.slug}`
                  : `/dashboard/exercises/${exercise.slug}`
              }
            >
              <ExerciseCard exercise={exercise} />
            </Link>
            <div className="absolute right-2 bottom-2 z-10">
              <EditExerciseButton exercise={exercise} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

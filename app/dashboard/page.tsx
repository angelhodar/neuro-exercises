import Link from "next/link";
import {
  getExercises,
  getUnregisteredExerciseSlugs,
} from "@/app/actions/exercises";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { exerciseHasAssets } from "@/app/exercises/loader";
import { CardActionStop } from "@/components/exercises/card-action-stop";
import ExerciseCard from "@/components/exercises/exercise-card";
import { Button } from "@/components/ui/button";
import EditExerciseButton from "./exercises/edit-exercise";
import RegisterExerciseButton from "./exercises/register-exercise-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [exercises, unregisteredSlugs] = await Promise.all([
    getExercises(),
    getUnregisteredExerciseSlugs(),
  ]);

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
          <RegisterExerciseButton unregisteredSlugs={unregisteredSlugs} />
          <Button render={<Link href="/dashboard/exercises/create" />}>
            Crear nuevo ejercicio
          </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
        {exerciseAssetChecks.map((exercise) => (
          <Link
            className="group block h-full focus:outline-none"
            href={
              exercise.hasAssets
                ? `/exercises/${exercise.slug}`
                : `/dashboard/exercises/${exercise.slug}`
            }
            key={exercise.id}
          >
            <ExerciseCard exercise={exercise}>
              <CardActionStop>
                <EditExerciseButton exercise={exercise} />
              </CardActionStop>
            </ExerciseCard>
          </Link>
        ))}
      </div>
    </>
  );
}

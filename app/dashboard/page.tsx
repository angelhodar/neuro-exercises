import Link from "next/link";
import {
  getExercises,
  getUnregisteredExerciseSlugs,
} from "@/app/actions/exercises";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { exerciseHasAssets } from "@/app/exercises/loader";
import { CardActionStop } from "@/components/exercises/card-action-stop";
import {
  ExerciseCard,
  ExerciseCardActions,
  ExerciseCardThumbnail,
  ExerciseCardTitle,
} from "@/components/exercises/exercise-card";
import { Button } from "@/components/ui/button";
import ExerciseSearch from "./exercise-search";
import EditExerciseButton from "./exercises/edit-exercise";
import RegisterExerciseButton from "./exercises/register-exercise-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [exercises, unregisteredSlugs] = await Promise.all([
    getExercises(undefined, q),
    getUnregisteredExerciseSlugs(),
  ]);

  const exerciseAssetChecks = await Promise.all(
    exercises.map(async (exercise) => ({
      ...exercise,
      hasAssets: await exerciseHasAssets(exercise.slug),
    }))
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Ejercicios</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona y configura los ejercicios cognitivos.
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <ExerciseSearch />
          <RegisterExerciseButton unregisteredSlugs={unregisteredSlugs} />
          <Button render={<Link href="/dashboard/exercises/create" />}>
            Crear nuevo ejercicio
          </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      {exerciseAssetChecks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <ExerciseCard
                className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg group-focus:ring-2 group-focus:ring-primary/40"
                exercise={exercise}
              >
                <ExerciseCardThumbnail />
                <ExerciseCardTitle />
                <ExerciseCardActions>
                  <CardActionStop>
                    <EditExerciseButton exercise={exercise} />
                  </CardActionStop>
                </ExerciseCardActions>
              </ExerciseCard>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No se encontraron ejercicios.
        </p>
      )}
    </div>
  );
}

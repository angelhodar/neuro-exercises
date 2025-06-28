import Link from "next/link";
import ExerciseCard from "@/components/exercises/exercise-card";
import { getExercises } from "@/app/actions/exercises";
import CreateExerciseButton from "./exercises/create-exercise";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderActions,
} from "@/components/dashboard-header";
import { getExerciseFromRegistry } from "../exercises/registry";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getExercises();

  return (
    <>
      <DashboardHeader>
        <DashboardHeaderTitle>Ejercicios</DashboardHeaderTitle>
        <DashboardHeaderActions>
          <CreateExerciseButton />
        </DashboardHeaderActions>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {exercises.map((exercise) => (
          <Link
            key={exercise.id}
            href={
              !!getExerciseFromRegistry(exercise.slug)
                ? `/exercises/${exercise.slug}`
                : `/dashboard/exercises/pending/${exercise.slug}`
            }
            className="block group focus:outline-none h-full"
          >
            <ExerciseCard key={exercise.id} exercise={exercise} />
          </Link>
        ))}
      </div>
    </>
  );
}

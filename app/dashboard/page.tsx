import { ExerciseCard } from "@/components/exercises/exercise-card";
import { getAvailableExercises } from "@/app/actions/exercises";
import CreateExerciseButton from "./exercises/create-exercise";
import { DashboardHeader, DashboardHeaderTitle, DashboardHeaderActions } from "@/components/dashboard-header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getAvailableExercises();

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
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </>
  );
}

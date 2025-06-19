import { ExerciseCard } from "@/components/exercises/exercise-card";
import { getAvailableExercises } from "@/app/actions/exercises";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getAvailableExercises();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}

import { ExerciseCard } from "@/components/exercises/exercise-card";
import { getAvailableExercises } from "@/app/actions/exercises";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exercises = await getAvailableExercises();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Aquí puedes ver tus ejercicios y progreso.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Ejercicios Disponibles</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
}

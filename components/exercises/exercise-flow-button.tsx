import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";

export function ExerciseFlowButton() {
  const { exerciseState, nextQuestion, resetExercise } = useExerciseExecution();

  if (exerciseState === "executing") {
    return <Button onClick={nextQuestion}>Siguiente pregunta</Button>;
  }

  if (exerciseState === "finished") {
    return <Button onClick={resetExercise}>Reiniciar</Button>;
  }

  return null;
}

"use client"

import { Button } from "@/components/ui/button"
import { useExerciseExecution } from "@/hooks/use-exercise-execution"

export function ExerciseControls() {
  const { exerciseState, startExercise, resetExercise } = useExerciseExecution()

  return (
    <div className="flex gap-4 mt-4">
      {exerciseState === "ready" && <Button onClick={startExercise}>Comenzar Ejercicio</Button>}
      {exerciseState === "executing" && (
        <Button variant="outline" onClick={resetExercise}>
          Reiniciar
        </Button>
      )}
    </div>
  )
}

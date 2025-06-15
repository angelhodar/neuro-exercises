"use client"

import { Button } from "@/components/ui/button"
import type { ExerciseState } from "@/contexts/exercise-context"

interface ExerciseControlsProps {
  exerciseState: ExerciseState
  onStart: () => void
  onReset: () => void
}

export function ExerciseControls({ exerciseState, onStart, onReset }: ExerciseControlsProps) {
  return (
    <div className="flex gap-4 mt-4">
      {exerciseState === "ready" && <Button onClick={onStart}>Comenzar Ejercicio</Button>}
      {exerciseState === "executing" && (
        <Button variant="outline" onClick={onReset}>
          Reiniciar
        </Button>
      )}
    </div>
  )
}

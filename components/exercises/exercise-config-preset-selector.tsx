"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ExercisePreset } from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema"

interface ExerciseConfigPresetSelectorProps {
  presets: Record<ExercisePreset, object>
}

export function ExerciseConfigPresetSelector({
  presets,
}: ExerciseConfigPresetSelectorProps) {
  const { reset } = useFormContext()

  function handlePresetSelect(presetKey: ExercisePreset) {
    const preset = presets[presetKey]
    if (preset) reset(preset)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Configuraciones Rápidas
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(presets) as ExercisePreset[]).map((key) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetSelect(key)}
            className="capitalize"
          >
            {key === "easy" ? "fácil" : key === "medium" ? "medio" : key === "hard" ? "difícil" : "experto"}
          </Button>
        ))}
      </div>
    </div>
  )
}

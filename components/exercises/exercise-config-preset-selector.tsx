"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { ExercisePreset } from "@/lib/schemas/base-schemas";

const PRESET_LABELS: Record<ExercisePreset, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
  expert: "Experto",
};

interface ExerciseConfigPresetSelectorProps {
  presets: Record<ExercisePreset, object>;
}

export function ExerciseConfigPresetSelector({
  presets,
}: ExerciseConfigPresetSelectorProps) {
  const { reset } = useFormContext();

  function handlePresetSelect(presetKey: ExercisePreset) {
    const preset = presets[presetKey];
    if (preset) {
      reset({ automaticNextQuestion: true, ...preset });
    }
  }

  return (
    <div className="space-y-3">
      <span className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Configuraciones Rápidas
      </span>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {(Object.keys(presets) as ExercisePreset[]).map((key) => (
          <Button
            key={key}
            onClick={() => handlePresetSelect(key)}
            size="sm"
            type="button"
            variant="outline"
          >
            {PRESET_LABELS[key]}
          </Button>
        ))}
      </div>
    </div>
  );
}

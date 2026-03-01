"use client";

import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { getExercisePresets } from "@/app/actions/presets";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useExerciseAssetsLoader } from "@/hooks/use-exercise-assets-loader";
import type { ExerciseConfigPreset } from "@/lib/db/schema";

interface ConfigureExerciseButtonProps {
  slug: string;
  index: number;
  exerciseId: number;
}

export default function ConfigureExerciseButton(
  props: ConfigureExerciseButtonProps
) {
  const { slug, index, exerciseId } = props;
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<ExerciseConfigPreset[]>([]);

  const { assets, isLoading, error } = useExerciseAssetsLoader(slug);

  useEffect(() => {
    getExercisePresets(exerciseId).then(setPresets);
  }, [exerciseId]);

  if (error) {
    console.error(`Error loading assets for ${slug}:`, error);
    return null;
  }

  if (!assets) {
    return null;
  }

  const basePath = `exercises.${index}.config.`;
  const { ConfigFieldsComponent } = assets;

  return (
    <>
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={() => setOpen(true)}
        type="button"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Pencil className="mr-2 h-4 w-4" />
        )}
        Configurar
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configura los parámetros del ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 border-t p-1 pt-4">
            <ExerciseConfigPresetSelector
              basePath={basePath}
              exerciseId={exerciseId}
              initialPresets={presets}
            />
            <Separator />
            <ExerciseBaseFields basePath={basePath} />
            <Separator />
            <ConfigFieldsComponent basePath={basePath} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

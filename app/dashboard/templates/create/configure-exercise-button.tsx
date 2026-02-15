"use client";

import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useExerciseAssetsLoader } from "@/hooks/use-exercise-assets-loader";

interface ConfigureExerciseButtonProps {
  slug: string;
  index: number;
}

export default function ConfigureExerciseButton(
  props: ConfigureExerciseButtonProps
) {
  const { slug, index } = props;
  const [open, setOpen] = useState(false);

  const { assets, isLoading, error } = useExerciseAssetsLoader(slug);

  if (error) {
    console.error(`Error loading assets for ${slug}:`, error);
    return null;
  }

  if (!assets) {
    return null;
  }

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configura los parámetros del ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 border-t p-1 pt-4">
            <ExerciseBaseFields basePath={`exercises.${index}.config.`} />
            <Separator />
            <ConfigFieldsComponent basePath={`exercises.${index}.config.`} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { useExerciseAssetsLoader } from "@/hooks/use-exercise-assets-loader";
import { Pencil, Loader2 } from "lucide-react";

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

  if (!assets) return null;

  const { ConfigFieldsComponent } = assets;

  return (
    <Fragment>
      <Button 
        type="button" 
        onClick={() => setOpen(true)} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Pencil className="w-4 h-4 mr-2" />
        )}
        Configurar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configura los parámetros del ejercicio</DialogTitle>
          </DialogHeader>
          <div className="p-1 pt-4 space-y-6 border-t">
            <ExerciseBaseFields basePath={`exercises.${index}.config.`} />
            <Separator />
            <ConfigFieldsComponent basePath={`exercises.${index}.config.`} />
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

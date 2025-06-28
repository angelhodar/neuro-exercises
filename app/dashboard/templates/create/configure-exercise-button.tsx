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
import { getExerciseFromRegistry } from "@/app/exercises/registry";
import { Pencil } from "lucide-react";

interface ConfigureExerciseButtonProps {
  slug: string;
  index: number;
}

export default function ConfigureExerciseButton(
  props: ConfigureExerciseButtonProps
) {
  const { slug, index } = props;
  const [open, setOpen] = useState(false);

  const entry = getExerciseFromRegistry(slug);

  if (!entry) return null;

  const { ConfigFieldsComponent } = entry;

  return (
    <Fragment>
      <Button type="button" onClick={() => setOpen(true)} className="w-full">
        <Pencil className="w-4 h-4 mr-2" />
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

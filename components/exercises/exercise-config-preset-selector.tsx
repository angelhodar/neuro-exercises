"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import {
  createExercisePreset,
  deleteExercisePreset,
  getExercisePresets,
} from "@/app/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  ExerciseConfigPreset,
  NewExerciseConfigPreset,
} from "@/lib/db/schema";

interface ExerciseConfigPresetSelectorProps {
  exerciseId: number;
}

export function ExerciseConfigPresetSelector({
  exerciseId,
}: ExerciseConfigPresetSelectorProps) {
  const { reset, getValues } = useFormContext();
  const [presets, setPresets] = useState<ExerciseConfigPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getExercisePresets(exerciseId).then(setPresets).catch(console.error);
  }, [exerciseId]);

  function handlePresetSelect(preset: ExerciseConfigPreset) {
    const config = preset.config as Record<string, unknown>;
    reset({ automaticNextQuestion: true, ...config });
  }

  function handleSavePreset() {
    const name = presetName.trim();
    if (!name) {
      return;
    }

    const currentValues = getValues();

    startTransition(async () => {
      try {
        const preset = await createExercisePreset({
          exerciseId,
          name,
          config: currentValues as NewExerciseConfigPreset["config"],
        });
        if (preset) {
          setPresets((prev) => [...prev, preset]);
        }
        setPresetName("");
        setDialogOpen(false);
        toast.success("Preset guardado");
      } catch (error) {
        console.error("Error saving preset:", error);
        toast.error("Error al guardar el preset");
      }
    });
  }

  function handleDeletePreset(presetId: number) {
    startTransition(async () => {
      try {
        await deleteExercisePreset(presetId);
        setPresets((prev) => prev.filter((p) => p.id !== presetId));
        toast.success("Preset eliminado");
      } catch (error) {
        console.error("Error deleting preset:", error);
        toast.error("Error al eliminar el preset");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Configuraciones Guardadas
        </span>
        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" type="button" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Guardar actual
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guardar configuración</DialogTitle>
              <DialogDescription>
                Guarda la configuración actual como un preset reutilizable.
              </DialogDescription>
            </DialogHeader>
            <Input
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSavePreset();
                }
              }}
              placeholder="Nombre del preset"
              value={presetName}
            />
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                }
              />
              <Button
                disabled={!presetName.trim() || isPending}
                onClick={handleSavePreset}
                type="button"
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {presets.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay presets guardados. Configura los parámetros y guarda la
          configuración actual.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {presets.map((preset) => (
            <div className="group relative" key={preset.id}>
              <Button
                className="w-full"
                onClick={() => handlePresetSelect(preset)}
                size="sm"
                type="button"
                variant="outline"
              >
                {preset.name}
              </Button>
              <button
                className="absolute -top-2 -right-2 hidden rounded-full bg-destructive p-1 text-destructive-foreground group-hover:block"
                disabled={isPending}
                onClick={() => handleDeletePreset(preset.id)}
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

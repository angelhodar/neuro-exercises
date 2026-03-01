"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import {
  createExercisePreset,
  deleteExercisePreset,
} from "@/app/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
  initialPresets: ExerciseConfigPreset[];
}

export function ExerciseConfigPresetSelector({
  exerciseId,
  initialPresets,
}: ExerciseConfigPresetSelectorProps) {
  const { reset, getValues } = useFormContext();
  const [presets, setPresets] = useState(initialPresets);
  const [selectedPreset, setSelectedPreset] =
    useState<ExerciseConfigPreset | null>(null);
  const [presetName, setPresetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handlePresetChange(value: unknown) {
    const id = value as number;
    const preset = presets.find((p) => p.id === id) ?? null;
    setSelectedPreset(preset);
    if (preset) {
      const config = preset.config as Record<string, unknown>;
      reset({ automaticNextQuestion: true, ...config });
    }
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
          setSelectedPreset(preset);
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

  function handleDeletePreset() {
    if (!selectedPreset) {
      return;
    }

    const presetId = selectedPreset.id;

    startTransition(async () => {
      try {
        await deleteExercisePreset(presetId);
        setPresets((prev) => prev.filter((p) => p.id !== presetId));
        setSelectedPreset(null);
        toast.success("Preset eliminado");
      } catch (error) {
        console.error("Error deleting preset:", error);
        toast.error("Error al eliminar el preset");
      }
    });
  }

  return (
    <div className="space-y-3">
      <span className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Configuraciones Guardadas
      </span>
      <div className="flex items-center gap-2">
        <Combobox
          onValueChange={handlePresetChange}
          value={selectedPreset?.id ?? null}
        >
          <ComboboxInput
            className="flex-1"
            placeholder="Buscar preset..."
            showClear={!!selectedPreset}
          />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No se encontraron presets</ComboboxEmpty>
              {presets.map((preset) => (
                <ComboboxItem key={preset.id} value={preset.id}>
                  {preset.name}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="icon"
                title="Guardar actual"
                type="button"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
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

        <Button
          disabled={!selectedPreset || isPending}
          onClick={handleDeletePreset}
          size="icon"
          title="Eliminar preset"
          type="button"
          variant="outline"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

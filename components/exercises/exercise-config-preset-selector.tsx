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

const TRAILING_DOT = /\.$/;

interface ExerciseConfigPresetSelectorProps {
  exerciseId: number;
  initialPresets: ExerciseConfigPreset[];
  basePath?: string;
}

export function ExerciseConfigPresetSelector({
  exerciseId,
  initialPresets,
  basePath,
}: ExerciseConfigPresetSelectorProps) {
  const { reset, getValues, setValue } = useFormContext();
  const [presets, setPresets] = useState(initialPresets);
  const [selectedPreset, setSelectedPreset] =
    useState<ExerciseConfigPreset | null>(null);
  const [presetName, setPresetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handlePresetChange(value: unknown) {
    const name = value as string;
    const preset = presets.find((p) => p.name === name) ?? null;
    setSelectedPreset(preset);
    if (preset) {
      const config = preset.config as Record<string, unknown>;
      if (basePath) {
        for (const [key, val] of Object.entries(config)) {
          setValue(`${basePath}${key}`, val);
        }
      } else {
        reset({ automaticNextQuestion: true, ...config });
      }
    }
  }

  function handleSavePreset() {
    const name = presetName.trim();
    if (!name) {
      return;
    }

    const configPath = basePath?.replace(TRAILING_DOT, "");
    const currentValues = configPath ? getValues(configPath) : getValues();

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
    <div className="space-y-2">
      <span className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Configuraciones guardadas
      </span>
      <div className="mt-1 flex items-center gap-2">
        <Combobox
          items={presets.map((p) => p.name)}
          onValueChange={handlePresetChange}
          value={selectedPreset?.name ?? null}
        >
          <ComboboxInput
            className="flex-1"
            placeholder="Buscar configuración..."
            showClear={!!selectedPreset}
            showTrigger={false}
          />
          <ComboboxContent>
            <ComboboxEmpty>No se encontraron presets</ComboboxEmpty>
            <ComboboxList>
              {(name: string) => (
                <ComboboxItem key={name} value={name}>
                  {name}
                </ComboboxItem>
              )}
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

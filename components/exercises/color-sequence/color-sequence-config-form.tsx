"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import {
  colorSequenceConfigSchema,
  defaultColorSequenceConfig,
  colorSequencePresets,
  type ColorSequenceConfig,
} from "./color-sequence-schema";

interface ColorSequenceConfigFormProps {
  defaultConfig?: Partial<ColorSequenceConfig>;
  onSubmit?: (config: ColorSequenceConfig) => void;
}

interface ColorSequenceConfigFieldsProps {
  basePath?: string;
}

export function ColorSequenceConfigFields({ basePath = "" }: ColorSequenceConfigFieldsProps) {
  const { control } = useFormContext();

  const numCellsPath = `${basePath}numCells`;
  const sequenceLengthPath = `${basePath}sequenceLength`;
  const highlightIntervalPath = `${basePath}highlightInterval`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={numCellsPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de celdas</FormLabel>
            <FormControl>
              <Input type="number" placeholder="6" {...field} />
            </FormControl>
            <FormDescription>Cantidad total de celdas (máximo 12)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={sequenceLengthPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Longitud de la secuencia</FormLabel>
            <FormControl>
              <Input type="number" placeholder="3" {...field} />
            </FormControl>
            <FormDescription>Cantidad de celdas que se iluminarán por pregunta</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={highlightIntervalPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intervalo de iluminación (ms)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="1000" {...field} />
            </FormControl>
            <FormDescription>Tiempo entre iluminaciones de cada celda</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function ColorSequenceConfigForm({ defaultConfig, onSubmit }: ColorSequenceConfigFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(colorSequenceConfigSchema),
    defaultValues: {
      ...defaultColorSequenceConfig,
      ...defaultConfig,
    },
  });

  function handleSubmit(data: ColorSequenceConfig) {
    try {
      const validated = colorSequenceConfigSchema.parse(data);
      if (onSubmit) {
        onSubmit(validated);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validated));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Secuencia de Colores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ExerciseConfigPresetSelector presets={colorSequencePresets} />
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <ColorSequenceConfigFields />
            <Separator />
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 
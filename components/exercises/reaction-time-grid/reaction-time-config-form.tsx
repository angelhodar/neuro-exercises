"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  reactionTimeGridConfigSchema,
  defaultReactionTimeConfig,
  reactionTimePresets,
  type ReactionTimeGridConfig,
} from "./reaction-time-grid-schema";

interface ReactionTimeConfigFormProps {
  defaultConfig?: Partial<ReactionTimeGridConfig>;
  onSubmit?: (config: ReactionTimeGridConfig) => void;
}

interface ReactionTimeConfigFieldsProps {
  basePath?: string;
}

export function ReactionTimeConfigFields(props: ReactionTimeConfigFieldsProps) {
  const { basePath = "" } = props;
  const { control } = useFormContext();

  const gridSizePath = `${basePath}gridSize`;
  const cellsPath = `${basePath}cells`;
  const delayMinPath = `${basePath}delayMin`;
  const delayMaxPath = `${basePath}delayMax`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={gridSizePath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tamaño de la cuadrícula</FormLabel>
            <FormControl>
              <Input type="number" placeholder="10" {...field} />
            </FormControl>
            <FormDescription>
              Número de celdas en cada fila y columna
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={cellsPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Celdas</FormLabel>
            <FormControl>
              <Input type="number" placeholder="1" {...field} />
            </FormControl>
            <FormDescription>
              Número de celdas a resaltar por pregunta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={delayMinPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retraso mínimo (ms)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="1000" {...field} />
            </FormControl>
            <FormDescription>
              Tiempo mínimo antes de que aparezca el objetivo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={delayMaxPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retraso máximo (ms)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="3000" {...field} />
            </FormControl>
            <FormDescription>
              Tiempo máximo antes de que aparezca el objetivo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function ReactionTimeConfigForm({
  defaultConfig,
  onSubmit,
}: ReactionTimeConfigFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(reactionTimeGridConfigSchema),
    defaultValues: {
      ...defaultReactionTimeConfig,
      ...defaultConfig,
    },
  });

  function handleSubmit(data: ReactionTimeGridConfig) {
    try {
      const validatedData = reactionTimeGridConfigSchema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cuadrícula de reacción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <ExerciseConfigPresetSelector presets={reactionTimePresets} />
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <ReactionTimeConfigFields />
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

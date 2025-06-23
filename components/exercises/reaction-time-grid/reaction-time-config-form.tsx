"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

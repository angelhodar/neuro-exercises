"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ReactionTimeConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields(props: ReactionTimeConfigFieldsProps) {
  const { basePath = "" } = props;
  const { control } = useFormContext();

  const gridSizePath = `${basePath}gridSize`;
  const cellsPath = `${basePath}cells`;
  const delayMinPath = `${basePath}delayMin`;
  const delayMaxPath = `${basePath}delayMax`;
  const cellDisplayDurationPath = `${basePath}cellDisplayDuration`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={gridSizePath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tamaño de la cuadrícula</FormLabel>
            <FormControl>
              <Input placeholder="10" type="number" {...field} />
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
              <Input placeholder="1" type="number" {...field} />
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
              <Input placeholder="1000" type="number" {...field} />
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
              <Input placeholder="3000" type="number" {...field} />
            </FormControl>
            <FormDescription>
              Tiempo máximo antes de que aparezca el objetivo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={cellDisplayDurationPath}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Duración de visualización (ms)</FormLabel>
            <FormControl>
              <Input placeholder="2000" type="number" {...field} />
            </FormControl>
            <FormDescription>
              Tiempo que las celdas objetivo permanecen iluminadas antes de
              pasar automáticamente a la siguiente pregunta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

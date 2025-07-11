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

interface ColorSequenceConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields({
  basePath = "",
}: ColorSequenceConfigFieldsProps) {
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
            <FormDescription>
              Cantidad total de celdas (máximo 12)
            </FormDescription>
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
            <FormDescription>
              Cantidad de celdas que se iluminarán por pregunta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="col-span-full">
        <FormField
          control={control}
          name={highlightIntervalPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intervalo de iluminación (ms)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000" {...field} />
              </FormControl>
              <FormDescription>
                Tiempo entre iluminaciones de cada celda
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 
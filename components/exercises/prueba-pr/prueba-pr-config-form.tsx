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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input"; // For displaying slider value

interface StroopTestConfigFieldsProps {
  basePath?: string;
}

export function PruebaPrConfigForm({
  basePath = "",
}: StroopTestConfigFieldsProps) {
  const { control, watch } = useFormContext();

  const testModePath = `${basePath}testMode`;
  const incongruentRatioPath = `${basePath}incongruentRatio`;

  const testMode = watch(testModePath);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={testModePath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modo de Prueba</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el modo de prueba" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="mixed">
                  Mixto (Congruente e Incongruente)
                </SelectItem>
                <SelectItem value="congruent">Solo Congruente</SelectItem>
                <SelectItem value="incongruent">Solo Incongruente</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Define si las pruebas serán mixtas, solo congruentes o solo
              incongruentes.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {testMode === "mixed" && (
        <FormField
          control={control}
          name={incongruentRatioPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proporción de Pruebas Incongruentes</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={(val) => field.onChange(val[0])}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="w-20 text-center"
                    step="0.1"
                    min="0"
                    max="1"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Porcentaje de pruebas que serán incongruentes en modo mixto (0.0
                a 1.0).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

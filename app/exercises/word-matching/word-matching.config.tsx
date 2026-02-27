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
import { Switch } from "@/components/ui/switch";

interface WordMatchingConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields({ basePath = "" }: WordMatchingConfigFieldsProps) {
  const { control } = useFormContext();

  const groupsPerRoundPath = `${basePath}groupsPerRound`;
  const numberOfColumnsPath = `${basePath}numberOfColumns`;
  const requirePhrasePath = `${basePath}requirePhrase`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={groupsPerRoundPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupos por ronda</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value, 10))
                }
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nº de grupos" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3">3 grupos</SelectItem>
                  <SelectItem value="4">4 grupos</SelectItem>
                  <SelectItem value="5">5 grupos</SelectItem>
                  <SelectItem value="6">6 grupos</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Número de asociaciones de palabras que aparecen en cada ronda
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={numberOfColumnsPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Columnas</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value, 10))
                }
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nº de columnas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-[280px]">
                  <SelectItem value="2">2 — Objeto, Categoría</SelectItem>
                  <SelectItem value="3">3 — + Característica</SelectItem>
                  <SelectItem value="4">4 — + Acción</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Dimensiones semánticas visibles para emparejar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={requirePhrasePath}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Formar frase</FormLabel>
              <FormDescription>
                Tras emparejar un grupo, el usuario debe escribir una frase
                combinando las palabras
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

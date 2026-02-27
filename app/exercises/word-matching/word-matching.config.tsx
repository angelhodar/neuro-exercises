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
                  <SelectValue placeholder="Selecciona el número de grupos" />
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
              Número de grupos de palabras que se muestran en cada ronda
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
            <FormLabel>Número de columnas</FormLabel>
            <Select
              onValueChange={(value) =>
                field.onChange(Number.parseInt(value, 10))
              }
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el número de columnas" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="2">
                  2 columnas (Objeto, Categoría)
                </SelectItem>
                <SelectItem value="3">
                  3 columnas (Objeto, Categoría, Característica)
                </SelectItem>
                <SelectItem value="4">
                  4 columnas (Objeto, Categoría, Característica, Acción)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Número de columnas de palabras a emparejar
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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

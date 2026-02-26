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

interface WordMatchingConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields({ basePath = "" }: WordMatchingConfigFieldsProps) {
  const { control } = useFormContext();

  const groupsPerRoundPath = `${basePath}groupsPerRound`;

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
                <SelectItem value="3">3 grupos (9 palabras)</SelectItem>
                <SelectItem value="4">4 grupos (12 palabras)</SelectItem>
                <SelectItem value="5">5 grupos (15 palabras)</SelectItem>
                <SelectItem value="6">6 grupos (18 palabras)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Número de grupos de palabras que se muestran en cada ronda
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

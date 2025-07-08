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

interface SyllablesConfigFieldsProps {
  basePath?: string;
}

export function SyllablesConfigFields(props: SyllablesConfigFieldsProps) {
  const { basePath = "" } = props;
  const { control } = useFormContext();

  const syllablesCountPath = `${basePath}syllablesCount`;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={syllablesCountPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Sílabas</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number.parseInt(value))}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el número de sílabas" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="3">3 sílabas</SelectItem>
                <SelectItem value="4">4 sílabas</SelectItem>
                <SelectItem value="5">5 sílabas</SelectItem>
                <SelectItem value="6">6 sílabas</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Las palabras tendrán esta cantidad de sílabas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

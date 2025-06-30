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

interface StroopColorInterferenceConfigFieldsProps {
  basePath?: string;
}

export function StroopColorInterferenceConfigFields({
  basePath = "",
}: StroopColorInterferenceConfigFieldsProps) {
  const { control } = useFormContext();
  const numOptions = `${basePath}numOptions`;

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField
        control={control}
        name={numOptions}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de opciones</FormLabel>
            <FormControl>
              <Input type="number" placeholder="4" {...field} />
            </FormControl>
            <FormDescription>
              Cantidad de botones de respuesta que se mostrarán.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

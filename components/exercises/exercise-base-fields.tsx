"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function ExerciseBaseFields() {
  const { control } = useFormContext()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configuración del Ejercicio</h3>

      <FormField
        control={control}
        name="totalQuestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total de Preguntas</FormLabel>
            <FormControl>
              <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(e.target.value)} />
            </FormControl>
            <FormDescription>Número de preguntas en el ejercicio (1-100)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

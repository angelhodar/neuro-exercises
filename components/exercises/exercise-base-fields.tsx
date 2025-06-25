"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface ExerciseBaseFieldsProps {
  basePath?: string
}

export function ExerciseBaseFields(props: ExerciseBaseFieldsProps) {
  const { basePath = "" } = props
  const { control } = useFormContext()

  const totalQuestionsPath = `${basePath}totalQuestions`
  const timerDurationPath = `${basePath}timerDuration`

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={totalQuestionsPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de ensayos</FormLabel>
            <FormControl>
              <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(e.target.value)} />
            </FormControl>
            <FormDescription>Total de ensayos del ejercicio</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
          control={control}
          name={timerDurationPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de tiempo por pregunta</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="60"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormDescription>En segundos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
    </div>
  )
}

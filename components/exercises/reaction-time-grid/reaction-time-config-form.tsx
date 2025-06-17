"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields"
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector"
import {
  reactionTimeGridConfigSchema,
  defaultReactionTimeConfig,
  reactionTimePresets,
  type ReactionTimeGridConfig,
} from "./reaction-time-grid-schema"

interface ReactionTimeConfigFormProps {
  defaultConfig?: Partial<ReactionTimeGridConfig>
  onSubmit: (config: ReactionTimeGridConfig) => void
}

// Update the ReactionTimeConfigFields component with Spanish labels and descriptions
function ReactionTimeConfigFields() {
  const { control, watch } = useFormContext<ReactionTimeGridConfig>()
  const gridSize = watch("gridSize")
  const maxCells = gridSize * gridSize

  return (
    <>
      {/* Grid Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración de la Cuadrícula</h3>

        <FormField
          control={control}
          name="gridSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamaño de la Cuadrícula</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormDescription>Número de celdas en cada fila y columna (3-20)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cells"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celdas Objetivo</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormDescription>Número de celdas a resaltar por pregunta (1-{maxCells})</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Timing Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración de Tiempo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="delayMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retraso Mínimo (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
                <FormDescription>Tiempo mínimo antes de que aparezca el objetivo</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="delayMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retraso Máximo (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3000" {...field} />
                </FormControl>
                <FormDescription>Tiempo máximo antes de que aparezca el objetivo</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  )
}

export function ReactionTimeConfigForm({ defaultConfig, onSubmit }: ReactionTimeConfigFormProps) {
  const form = useForm<ReactionTimeGridConfig>({
    resolver: zodResolver(reactionTimeGridConfigSchema),
    defaultValues: {
      ...defaultReactionTimeConfig,
      ...defaultConfig,
    },
  })

  function handleSubmit(data: ReactionTimeGridConfig) {
    console.log("Formulario enviado con datos:", data)
    try {
      // Validate the data manually to catch any schema issues
      const validatedData = reactionTimeGridConfigSchema.parse(data)
      console.log("Datos validados:", validatedData)
      onSubmit(validatedData)
    } catch (error) {
      console.error("Error de validación del esquema:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuración del ejercicio</CardTitle>
        <CardDescription>Configura los parámetros para el ejercicio de tiempo de reacción</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ExerciseConfigPresetSelector presets={reactionTimePresets} />
            <Separator />
            <ReactionTimeConfigFields />
            <Separator />
            <ExerciseBaseFields />
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ExerciseBaseFields } from "@/components/exercise-base-fields"
import { ExerciseConfigPresetSelector } from "@/components/exercise-config-preset-selector"
import {
  syllablesConfigSchema,
  defaultSyllablesConfig,
  syllablesPresets,
  spanishWordsDataset,
  type SyllablesConfig,
} from "./syllables-schema"

interface SyllablesConfigFormProps {
  defaultConfig?: Partial<SyllablesConfig>
  onSubmit: (config: SyllablesConfig) => void
}

function SyllablesConfigFields() {
  const { control, watch } = useFormContext<SyllablesConfig>()
  const syllablesCount = watch("syllablesCount")
  const availableWords = syllablesCount ? spanishWordsDataset[syllablesCount as keyof typeof spanishWordsDataset] : []

  return (
    <>
      {/* Syllables Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración de Sílabas</h3>

        <FormField
          control={control}
          name="syllablesCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Sílabas</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                defaultValue={field.value?.toString()}
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
                Las palabras tendrán esta cantidad de sílabas ({availableWords?.length || 0} palabras disponibles)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de Tiempo (segundos)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormDescription>Tiempo máximo permitido por pregunta (5-120 segundos)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Preview */}
      {availableWords && availableWords.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Ejemplos de Palabras</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {availableWords.slice(0, 4).map((wordData, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">{wordData.word}:</span>
                  <span className="text-muted-foreground">{wordData.syllables.join(" - ")}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export function SyllablesConfigForm({ defaultConfig, onSubmit }: SyllablesConfigFormProps) {
  const form = useForm<SyllablesConfig>({
    resolver: zodResolver(syllablesConfigSchema),
    defaultValues: {
      ...defaultSyllablesConfig,
      ...defaultConfig,
    },
  })

  function handleSubmit(data: SyllablesConfig) {
    console.log("Formulario de sílabas enviado con datos:", data)
    try {
      const validatedData = syllablesConfigSchema.parse(data)
      console.log("Datos de sílabas validados:", validatedData)
      onSubmit(validatedData)
    } catch (error) {
      console.error("Error de validación del esquema de sílabas:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuración del Ejercicio de Sílabas</CardTitle>
        <CardDescription>Configura los parámetros para tu ejercicio de unión de sílabas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ExerciseConfigPresetSelector presets={syllablesPresets} />

            <Separator />

            <SyllablesConfigFields />

            <Separator />

            <ExerciseBaseFields />

            {/* Form Actions */}
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

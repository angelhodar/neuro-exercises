"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields"
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector"
import {
  stimulusCountConfigSchema,
  defaultStimulusCountConfig,
  stimulusCountPresets,
  type StimulusCountConfig,
} from "./stimulus-count-schema"
import { Switch } from "@/components/ui/switch"

interface StimulusCountConfigFormProps {
  defaultConfig?: Partial<StimulusCountConfig>
  onSubmit?: (config: StimulusCountConfig) => void
}

interface StimulusCountConfigFieldsProps {
  basePath?: string
}

export function StimulusCountConfigFields({ basePath = "" }: StimulusCountConfigFieldsProps) {
  const { control } = useFormContext()

  const minStimuliPath = `${basePath}minStimuli`
  const maxStimuliPath = `${basePath}maxStimuli`
  const allowOverlapPath = `${basePath}allowOverlap`

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={minStimuliPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mínimo de estímulos</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="5"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
              />
            </FormControl>
            <FormDescription>Mínimo de estímulos por pregunta</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={maxStimuliPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Máximo de estímulos</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="10"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
              />
            </FormControl>
            <FormDescription>Máximo de estímulos por pregunta</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={allowOverlapPath}
        render={({ field }) => (
          <FormItem className="col-span-full flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Permitir solapamiento</FormLabel>
              <FormDescription>
                {field.value
                  ? "Los estímulos pueden solaparse parcialmente"
                  : "Los estímulos se mostrarán sin solaparse"}
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export function StimulusCountConfigForm({ defaultConfig, onSubmit }: StimulusCountConfigFormProps) {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(stimulusCountConfigSchema),
    defaultValues: {
      ...defaultStimulusCountConfig,
      ...defaultConfig,
    },
  })

  function handleSubmit(data: StimulusCountConfig) {
    try {
      const validated = stimulusCountConfigSchema.parse(data)
      if (onSubmit) {
        onSubmit(validated)
        return
      }
      const params = new URLSearchParams()
      params.set("config", JSON.stringify(validated))
      router.push(`?${params.toString()}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Conteo de Estímulos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ExerciseConfigPresetSelector presets={stimulusCountPresets} />
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <StimulusCountConfigFields />
            <Separator />
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 
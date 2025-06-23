"use client"

import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

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
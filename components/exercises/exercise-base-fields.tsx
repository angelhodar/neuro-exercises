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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface ExerciseBaseFieldsProps {
  basePath?: string;
}

export function ExerciseBaseFields(props: ExerciseBaseFieldsProps) {
  const { basePath = "" } = props;
  const { control } = useFormContext();

  const totalQuestionsPath = `${basePath}totalQuestions`;
  const timerDurationPath = `${basePath}timerDuration`;
  const automaticNextQuestionPath = `${basePath}automaticNextQuestion`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-full">
        <FormField
          control={control}
          name={totalQuestionsPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de ensayos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>Total de ensayos del ejercicio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/*<FormField
        control={control}
        name={timerDurationPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Límite de tiempo por ensayo</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="60"
                {...field}
                onChange={(e) =>
                  field.onChange(parseInt(e.target.value, 10) || 0)
                }
              />
            </FormControl>
            <FormDescription>En segundos</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />*/}

      <div className="col-span-full">
        <FormField
          control={control}
          name={automaticNextQuestionPath}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Avanzar automáticamente de ensayo</FormLabel>
                <FormDescription>
                  Avanzar automáticamente al siguiente ensayo al terminar el
                  actual
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

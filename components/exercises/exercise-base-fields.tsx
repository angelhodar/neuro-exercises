"use client";

import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface ExerciseBaseFieldsProps {
  basePath?: string;
  hasIntrinsicGoal?: boolean;
}

export function ExerciseBaseFields(props: ExerciseBaseFieldsProps) {
  const { basePath = "", hasIntrinsicGoal = false } = props;
  const { control, watch, setValue } = useFormContext();

  const endConditionTypePath = `${basePath}endConditionType`;
  const totalQuestionsPath = `${basePath}totalQuestions`;
  const automaticNextQuestionPath = `${basePath}automaticNextQuestion`;
  
  const enableTimeLimitPath = `${basePath}enableTimeLimit`;
  const timeLimitSecondsPath = `${basePath}timeLimitSeconds`;

  const endConditionType = watch(endConditionTypePath);
  const enableTimeLimit = watch(enableTimeLimitPath);

  useEffect(() => {
    if (!enableTimeLimit) setValue(timeLimitSecondsPath, 0);
    if (endConditionType === "questions") setValue(timeLimitSecondsPath, 0);
    else if (endConditionType === "time") setValue(totalQuestionsPath, 0);
  }, [enableTimeLimit, endConditionType, timeLimitSecondsPath, totalQuestionsPath]);

  if (hasIntrinsicGoal) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-full">
          <FormField
            control={control}
            name={enableTimeLimitPath}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Habilitar tiempo límite</FormLabel>
                  <FormDescription>
                    Si está activado, el ejercicio terminará cuando se acabe el tiempo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {enableTimeLimit && (
          <div className="col-span-full">
            <FormField
              control={control}
              name={timeLimitSecondsPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo límite (segundos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Duración máxima del ejercicio en segundos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-full">
        <FormField
          control={control}
          name={endConditionTypePath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condición de finalización</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultValue="questions"
                >
                  <SelectTrigger className="w-full" />
                  <SelectContent>
                    <SelectItem value="questions">Por número de ensayos</SelectItem>
                    <SelectItem value="time">Por tiempo límite</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Elige cómo finalizará el ejercicio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {endConditionType === "questions" && (
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
      )}

      {endConditionType === "time" && (
        <FormField
          control={control}
          name={timeLimitSecondsPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiempo límite (segundos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="60"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>Duración máxima del ejercicio en segundos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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

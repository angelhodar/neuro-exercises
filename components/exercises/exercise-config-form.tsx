"use client";

import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z, ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import type { ExercisePreset } from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema";

interface ExerciseConfigFormProps<TSchema extends ZodTypeAny> extends PropsWithChildren {
  title: string;
  schema: TSchema;
  defaultValues?: Partial<z.infer<TSchema>>;
  presets?: Record<ExercisePreset, Partial<z.infer<TSchema>>>;
  onSubmit?: (config: z.infer<TSchema>) => void;
}

export function ExerciseConfigForm<TSchema extends ZodTypeAny>({
  title,
  schema,
  defaultValues,
  presets,
  onSubmit,
  children,
}: ExerciseConfigFormProps<TSchema>) {
  const router = useRouter();

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.infer<TSchema>,
  });

  function handleSubmit(data: z.infer<TSchema>) {
    try {
      const validatedData = schema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {presets && (
              <>
                {/* Selector de presets */}
                <ExerciseConfigPresetSelector presets={presets} />
                <Separator />
              </>
            )}

            {/* Campos base comunes (totalQuestions, etc.) */}
            <ExerciseBaseFields />
            <Separator />

            {/* Campos específicos del ejercicio */}
            {children}
            <Separator />

            {/* Acciones */}
            <div className="flex justify-end">
              <Button type="submit">Comenzar</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 
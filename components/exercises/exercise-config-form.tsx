"use client";

import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import { getExerciseFromClientRegistry } from "@/app/registry/registry.client";

interface ExerciseConfigFormProps extends PropsWithChildren {
  slug: string;
  title: string;
  onSubmit?: (config: any) => void;
}

export function ExerciseConfigForm({
  slug,
  title,
  onSubmit,
  children,
}: ExerciseConfigFormProps) {
  const router = useRouter();

  const exerciseDetails = getExerciseFromClientRegistry(slug);

  if (!exerciseDetails) {
    console.error(`No se encontró el ejercicio con slug '${slug}' en el registro.`);
    return null;
  }

  const { schema, presets } = exerciseDetails;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: presets?.easy,
  });

  function handleSubmit(data: z.infer<typeof schema>) {
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
"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MediaSelector from "@/components/ui/templates/media-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OddOneOutConfigFieldsProps {
  basePath?: string;
}

export function OddOneOutConfigFields({ basePath = "" }: OddOneOutConfigFieldsProps) {
  const { control, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const totalQuestions = watch(`${basePath}totalQuestions`);

  // Sync the field array with the totalQuestions value
  useEffect(() => {
    const currentLength = fields.length;
    const targetLength = totalQuestions || 0;

    if (currentLength < targetLength) {
      for (let i = currentLength; i < targetLength; i++) {
        append({
          patternMedias: [],
          outlierMedia: [],
        });
      }
    } else if (currentLength > targetLength) {
      for (let i = currentLength; i > targetLength; i--) {
        remove(i - 1);
      }
    }
  }, [totalQuestions, fields.length, append, remove]);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-lg">Pregunta {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-2">
            <FormField
              control={control}
              name={`${basePath}questions.${index}.patternMedias`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imágenes del patrón</FormLabel>
                  <FormControl>
                    <MediaSelector
                      selectedMedias={field.value ?? []}
                      onMediasChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${basePath}questions.${index}.outlierMedia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen diferente</FormLabel>
                  <FormControl>
                    <MediaSelector
                      selectedMedias={field.value ?? []}
                      onMediasChange={field.onChange}
                      selectionMode="single"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

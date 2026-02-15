"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import MediaSelector from "@/components/media/media-selector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OddOneOutConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields({ basePath = "" }: OddOneOutConfigFieldsProps) {
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
    <Accordion className="h-96 space-y-6 overflow-y-auto" type="multiple">
      {fields.map((field, index) => (
        <AccordionItem
          className="rounded-md bg-gray-50/50 dark:bg-gray-900/50"
          key={field.id}
          value={`pregunta-${index}`}
        >
          <AccordionTrigger className="px-4 text-lg">
            Pregunta {index + 1}
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-none bg-transparent p-0 shadow-none">
              <CardContent className="space-y-4 p-2">
                <FormField
                  control={control}
                  name={`${basePath}questions.${index}.patternMedias`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imágenes del patrón</FormLabel>
                      <FormControl>
                        <MediaSelector
                          onMediasChange={field.onChange}
                          selectedMedias={field.value ?? []}
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
                          onMediasChange={field.onChange}
                          selectedMedias={field.value ?? []}
                          selectionMode="single"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

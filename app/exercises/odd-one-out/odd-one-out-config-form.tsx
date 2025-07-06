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
import MediaSelector from "@/components//media-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
    <Accordion type="multiple" className="space-y-6 overflow-y-auto h-96">
      {fields.map((field, index) => (
        <AccordionItem key={field.id} value={`pregunta-${index}`} className="bg-gray-50/50 dark:bg-gray-900/50 rounded-md">
          <AccordionTrigger className="px-4 text-lg">
            Pregunta {index + 1}
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-0 bg-transparent shadow-none border-none">
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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

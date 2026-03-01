"use client";

import { useFormContext } from "react-hook-form";
import MediaSelector from "@/components/media/media-selector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface OddOneOutConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields({ basePath = "" }: OddOneOutConfigFieldsProps) {
  const { control, watch } = useFormContext();
  const totalQuestions: number = watch(`${basePath}totalQuestions`) || 0;

  return (
    <Accordion className="h-96 space-y-2 overflow-y-auto" type="multiple">
      {Array.from({ length: totalQuestions }, (_, index) => (
        <AccordionItem
          className="rounded-md border"
          // biome-ignore lint/suspicious/noArrayIndexKey: positional slots derived from a count
          key={index}
          value={`pregunta-${index}`}
        >
          <AccordionTrigger className="px-3 py-2 text-sm">
            Pregunta {index + 1}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 px-3">
              <FormField
                control={control}
                name={`${basePath}questions.${index}.patternMedias`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MediaSelector
                        className="border-success"
                        compact
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
                    <FormControl>
                      <MediaSelector
                        className="border-destructive"
                        compact
                        onMediasChange={field.onChange}
                        selectedMedias={field.value ?? []}
                        selectionMode="single"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

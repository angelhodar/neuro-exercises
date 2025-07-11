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
import MultiSelectTags from "@/components//multiselect-tags";

interface VisualRecognitionConfigFieldsProps {
  basePath?: string;
}

export function ConfigFields(
  props: VisualRecognitionConfigFieldsProps
) {
  const { basePath = "" } = props;
  const { control, watch } = useFormContext();

  const imagesPerQuestionPath = `${basePath}imagesPerQuestion`;
  const correctImagesCountPath = `${basePath}correctImagesCount`;
  const showImageNamesPath = `${basePath}showImageNames`;
  const tagsPath = `${basePath}tags`;

  const showImageNames = watch(showImageNamesPath);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={imagesPerQuestionPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes por pregunta</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="6"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Número total de imágenes mostradas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={correctImagesCountPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes correctas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Número de imágenes correctas de la categoría objetivo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={tagsPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiquetas de las imágenes</FormLabel>
            <FormControl>
              <MultiSelectTags
                value={field.value ?? []}
                onChange={(tags: string[]) => field.onChange(tags)}
              />
            </FormControl>
            <FormDescription>
              Añade al menos 2 etiquetas para las imágenes que se usarán en el
              ejercicio.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={showImageNamesPath}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Mostrar nombres de imágenes</FormLabel>
              <FormDescription>
                {showImageNames
                  ? "Los nombres aparecerán debajo de cada imagen (más fácil)"
                  : "Solo se mostrarán las imágenes sin nombres (más difícil)"}
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
} 
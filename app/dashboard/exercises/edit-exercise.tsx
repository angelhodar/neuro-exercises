"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateExercise } from "@/app/actions/exercises";
import { MediaTagsInput } from "@/components/media/media-tags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise } from "@/lib/db/schema";
import {
  type UpdateExerciseSchema,
  updateExerciseSchema,
} from "@/lib/schemas/exercises";

interface EditExerciseButtonProps {
  exercise: Exercise;
}

export default function EditExerciseButton({
  exercise,
}: EditExerciseButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateExerciseSchema>({
    resolver: zodResolver(updateExerciseSchema),
    defaultValues: {
      id: exercise.id,
      displayName: exercise.displayName,
      description: exercise.description || "",
      tags: exercise.tags || [],
      thumbnailPrompt: "",
      file: undefined,
      audioPrompt: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: UpdateExerciseSchema) => {
    setError(null);
    try {
      const updated = await updateExercise(values);
      if (!updated) {
        throw new Error("Failed to update exercise");
      }
      setOpen(false);
    } catch (_e) {
      setError("Error actualizando el ejercicio");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="icon" variant="outline" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar ejercicio</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Modifica los detalles del ejercicio. Puedes generar una nueva
            miniatura con IA o subir tu propia imagen.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-2 flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del ejercicio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre atractivo del ejercicio"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-24"
                      placeholder="Descripción detallada del ejercicio..."
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <MediaTagsInput
                      onChange={field.onChange}
                      value={field.value || []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-base">
                Nueva miniatura (opcional)
              </FormLabel>
              <p className="mb-4 text-muted-foreground text-sm">
                Elige si quieres generar una nueva miniatura con IA o subir tu
                propia imagen
              </p>
              <Tabs defaultValue="generate">
                <TabsList className="mb-4 flex w-full">
                  <TabsTrigger className="flex-1" value="generate">
                    Generar con IA
                  </TabsTrigger>
                  <TabsTrigger className="flex-1" value="upload">
                    Subir manualmente
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="generate">
                  <FormField
                    control={form.control}
                    name="thumbnailPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt para nueva miniatura</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-20"
                            placeholder="Describe en inglés cómo debe verse la nueva miniatura del ejercicio..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-muted-foreground text-xs">
                          Describe en inglés los elementos visuales que quieres
                          en la miniatura
                        </p>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="upload">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subir imagen</FormLabel>
                        <FormControl>
                          <Input
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                            type="file"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-muted-foreground text-xs">
                          Sube una imagen JPG, PNG o similar para usar como
                          miniatura
                        </p>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <FormField
              control={form.control}
              name="audioPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nuevas instrucciones de audio (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-24"
                      placeholder="Describe las instrucciones que quieres que se generen como audio para este ejercicio..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Escribe en español las instrucciones que se convertirán en
                    audio para guiar al usuario
                  </p>
                </FormItem>
              )}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Actualizando..." : "Actualizar ejercicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

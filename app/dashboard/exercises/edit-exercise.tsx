"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import {
  updateExerciseSchema,
  UpdateExerciseSchema,
} from "@/lib/schemas/exercises";
import { updateExercise } from "@/app/actions/exercises";
import type { Exercise } from "@/lib/db/schema";
import { MediaTagsInput } from "@/components/ui/templates/media-tags";

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

  const { isSubmitting, errors } = form.formState;

  const onSubmit = async (values: UpdateExerciseSchema) => {
    setError(null);
    try {
      const updated = await updateExercise(values);
      if (!updated) throw new Error();
      setOpen(false);
    } catch (e) {
      setError("Error actualizando el ejercicio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar ejercicio</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Modifica los detalles del ejercicio. Puedes generar una nueva
            miniatura con IA o subir tu propia imagen.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
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
                      placeholder="Descripción detallada del ejercicio..."
                      className="min-h-24"
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
                      value={field.value || []}
                      onChange={field.onChange}
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
              <p className="text-sm text-muted-foreground mb-4">
                Elige si quieres generar una nueva miniatura con IA o subir tu
                propia imagen
              </p>
              <Tabs defaultValue="generate">
                <TabsList className="w-full flex mb-4">
                  <TabsTrigger value="generate" className="flex-1">
                    Generar con IA
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1">
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
                            placeholder="Describe en inglés cómo debe verse la nueva miniatura del ejercicio..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
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
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
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
                      placeholder="Describe las instrucciones que quieres que se generen como audio para este ejercicio..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Escribe en español las instrucciones que se convertirán en
                    audio para guiar al usuario
                  </p>
                </FormItem>
              )}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar ejercicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

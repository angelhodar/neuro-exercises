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
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputList } from "@/components/ui/tags-input";
import { createExerciseSchema, CreateExerciseSchema } from "@/lib/schemas/exercises";
import { createExercise } from "@/app/actions/exercises";

export default function CreateExerciseButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateExerciseSchema>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      slug: "",
      displayName: "",
      tags: [],
      description: "",
      thumbnail: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateExerciseSchema) => {
    setError(null);
    try {
      const created = await createExercise(values);
      if (!created) throw new Error();
      setOpen(false);
      form.reset();
    } catch (e) {
      setError("Error guardando el ejercicio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear nuevo ejercicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo ejercicio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador (slug)</FormLabel>
                  <FormControl>
                    <Input placeholder="visual-recognition" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del ejercicio" {...field} required />
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
                    <TagsInput
                      value={field.value ?? []}
                      onValueChange={(tags) => field.onChange(tags)}
                    >
                      <TagsInputList>
                        {(field.value ?? []).map((tag: string) => (
                          <TagsInputItem key={tag} value={tag}>
                            {tag}
                          </TagsInputItem>
                        ))}
                        <TagsInputInput placeholder="Añade etiquetas..." />
                      </TagsInputList>
                    </TagsInput>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miniatura</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
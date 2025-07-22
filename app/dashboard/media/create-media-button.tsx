"use client";

import { useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMediaSchema, CreateMediaSchema } from "@/lib/schemas/medias";
import { uploadMedia } from "@/app/actions/media";
import { MediaTagsInput } from "@/components/media/media-tags";
import React from "react";
import { Plus } from "lucide-react";

export default function CreateMediaButton() {
  const [open, setOpen] = useQueryState("create-dialog", parseAsBoolean.withDefault(false));
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("generate");

  const form = useForm<CreateMediaSchema>({
    resolver: zodResolver(createMediaSchema),
    defaultValues: {
      name: "",
      description: "",
      prompt: "",
      tags: [],
      file: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const inferMediaType = (file?: File): "image" | "audio" | "video" => {
    if (!file) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return "image";
  };

  const onSubmit = async (values: CreateMediaSchema) => {
    setError(null);
    try {
      // Infer mediaType before upload
      const mediaType = inferMediaType(values.file);
      await uploadMedia({ ...values, mediaType });
      setOpen(false);
      form.reset();
    } catch (e) {
      console.error(e);
      setError("Error guardando el archivo");
    }
  };

  // Watch file to determine if thumbnail input should be shown
  const file = form.watch("file");
  const manualType = file ? inferMediaType(file) : "image";
  const showThumbnailInput = manualType === "audio" || manualType === "video";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4" />
          Añadir contenido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo contenido</DialogTitle>
        </DialogHeader>
        {/* Move Tabs to the top */}
        <Tabs defaultValue="generate" value={tab} onValueChange={setTab}>
          <TabsList className="w-full flex my-4">
            <TabsTrigger value="generate" className="flex-1">
              Generar con IA
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              Subir manualmente
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            {/* Only show prompt if AI tab is selected */}
            {tab === "generate" && (
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones de generación</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Una manzana roja"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Only show manual fields if manual tab is selected */}
            {tab === "upload" && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del medio"
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Contenido</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*,audio/*,video/*"
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                {/* Show thumbnail input if audio or video */}
                {showThumbnailInput && (
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
                        <FormDescription>
                          Añade una imagen de miniatura para el audio o video
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                          placeholder="Añadir etiqueta..."
                        />
                      </FormControl>
                      <FormDescription>
                        Selecciona las etiquetas para este contenido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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

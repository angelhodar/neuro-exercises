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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMediaSchema, CreateMediaSchema } from "@/lib/schemas/medias";
import { uploadMedia } from "@/app/actions/media";
import { MediaTagsInput } from "@/components//media-tags";

export default function CreateMediaButton() {
  const [open, setOpen] = useQueryState("create-dialog", parseAsBoolean.withDefault(false));
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateMediaSchema>({
    resolver: zodResolver(createMediaSchema),
    defaultValues: {
      name: "",
      description: "",
      prompt: "",
      tags: [],
      file: undefined,
      mediaType: "image",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateMediaSchema) => {
    setError(null);
    try {
      await uploadMedia(values);
      setOpen(false);
      form.reset();
    } catch (e) {
      console.error(e);
      setError("Error guardando el archivo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Agregar nuevo medio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo medio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la imagen"
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
              name="mediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de medio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de medio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image">Imagen</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Selecciona las etiquetas para este medio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              </TabsContent>
              <TabsContent value="upload">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => {
                    const mediaType = form.watch("mediaType");
                    const getAcceptTypes = () => {
                      switch (mediaType) {
                        case "audio":
                          return "audio/*";
                        case "video":
                          return "video/*";
                        default:
                          return "image/*";
                      }
                    };
                    
                    return (
                      <FormItem>
                        <FormLabel>Archivo</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept={getAcceptTypes()}
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </TabsContent>
            </Tabs>
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

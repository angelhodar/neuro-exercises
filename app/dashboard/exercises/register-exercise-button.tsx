"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerExercise } from "@/app/actions/exercises";
import { MediaTagsInput } from "@/components/media/media-tags";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type RegisterExerciseSchema,
  registerExerciseSchema,
} from "@/lib/schemas/exercises";

interface RegisterExerciseButtonProps {
  unregisteredSlugs: string[];
}

export default function RegisterExerciseButton({
  unregisteredSlugs,
}: RegisterExerciseButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegisterExerciseSchema>({
    resolver: zodResolver(registerExerciseSchema),
    defaultValues: {
      slug: "",
      displayName: "",
      description: "",
      tags: [],
      thumbnailPrompt: "",
      file: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: RegisterExerciseSchema) => {
    setError(null);
    try {
      const created = await registerExercise(values);
      if (!created) {
        throw new Error("Failed to register exercise");
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (_e) {
      setError("Error registrando el ejercicio");
    }
  };

  const hasUnregistered = unregisteredSlugs.length > 0;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button variant="outline" />}>
        <PackagePlus className="mr-2 h-4 w-4" />
        Registrar ejercicio
        {hasUnregistered && (
          <Badge className="ml-2" variant="secondary">
            {unregisteredSlugs.length}
          </Badge>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registrar ejercicio existente</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Registra en la base de datos un ejercicio que ya tiene código
            implementado.
          </p>
        </DialogHeader>
        {hasUnregistered ? (
          <Form {...form}>
            <form
              className="mt-2 flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ejercicio</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {unregisteredSlugs.map((slug) => (
                            <SelectItem key={slug} value={slug}>
                              {slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-24"
                        placeholder="Descripción detallada del ejercicio..."
                        {...field}
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
                    <FormLabel>Etiquetas (opcional)</FormLabel>
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
                  Miniatura (opcional)
                </FormLabel>
                <p className="mb-4 text-muted-foreground text-sm">
                  Elige si quieres generar una miniatura con IA o subir tu
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
                          <FormLabel>Prompt para miniatura</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-20"
                              placeholder="Describe en inglés cómo debe verse la miniatura del ejercicio..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-muted-foreground text-xs">
                            Describe en inglés los elementos visuales que
                            quieres en la miniatura
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
                  {isSubmitting ? "Registrando..." : "Registrar ejercicio"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <p className="py-4 text-muted-foreground text-sm">
            Todos los ejercicios con código ya están registrados en la base de
            datos.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createOrganization } from "@/app/actions/organizations";
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
import { Textarea } from "@/components/ui/textarea";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().optional(),
  logo: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  metadata: z.string().optional(),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export default function CreateOrganizationButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      metadata: "",
    },
  });

  const onSubmit = async (data: CreateOrganizationFormValues) => {
    setIsLoading(true);

    try {
      await createOrganization(data);
      toast.success("Organización creada exitosamente");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Error al crear la organización");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Crear organización
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear nueva organización
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la organización *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Ej: NeuroGranada Research"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Ej: neurogranada-research"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-muted-foreground text-sm">
                      Si no se especifica, se generará automáticamente a partir
                      del nombre.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del logo (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="https://ejemplo.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información adicional (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Información adicional sobre la organización..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

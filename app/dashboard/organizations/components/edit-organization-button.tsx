"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateOrganization } from "@/app/actions/organizations";
import type { ButtonProps } from "@/components/ui/button";
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
import type { Organization } from "@/lib/db/schema";

const updateOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().optional(),
  logo: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  metadata: z.string().optional(),
});

type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;

interface EditOrganizationButtonProps extends ButtonProps {
  organization: Organization;
}

export default function EditOrganizationButton({
  organization,
  children,
  ...buttonProps
}: EditOrganizationButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug || "",
      logo: organization.logo || "",
      metadata: organization.metadata || "",
    },
  });

  const onSubmit = async (data: UpdateOrganizationFormValues) => {
    setIsLoading(true);

    try {
      await updateOrganization(organization.id, {
        name: data.name,
        slug: data.slug || undefined,
        logo: data.logo || undefined,
        metadata: data.metadata || undefined,
      });

      toast.success("Organización actualizada exitosamente");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Error al actualizar la organización");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button {...buttonProps} />}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Editar {organization.name}
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
                    <FormLabel>Metadatos (opcional)</FormLabel>
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
                    Actualizando...
                  </>
                ) : (
                  "Actualizar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

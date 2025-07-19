"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateOrganization } from "@/app/actions/organizations";
import { toast } from "sonner";
import type { Organization } from "@/lib/db/schema";

const updateOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().optional(),
  logo: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  metadata: z.string().optional(),
});

type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;

interface EditOrganizationPageProps {
  organization: Organization;
}

export default function EditOrganizationPage({
  organization,
}: EditOrganizationPageProps) {
  const router = useRouter();
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
      router.push("/dashboard/organizations");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Error al actualizar la organización");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="space-y-2">
          <DashboardHeaderTitle>Editar Organización</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Modifica la información de la organización.
          </DashboardHeaderDescription>
        </div>
      </DashboardHeader>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de {organization.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la organización *</FormLabel>
                      <FormControl>
                        <Input
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
                          placeholder="Información adicional sobre la organización..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/organizations")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

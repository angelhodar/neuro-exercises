"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clipboard, Plus, User } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createExerciseLink } from "@/app/actions/links";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createLinkSchema = z.object({
  targetUserId: z.string().min(1, "Selecciona un usuario"),
  templateId: z.string().min(1, "Selecciona una plantilla"),
});

type CreateLinkSchema = z.infer<typeof createLinkSchema>;

interface CreateLinkButtonProps {
  users: { id: string; name: string | null; email: string }[];
  templates: { id: number; title: string }[];
}

export default function CreateLinkButton({
  users,
  templates,
}: CreateLinkButtonProps) {
  const [open, setOpen] = useQueryState(
    "create-link",
    parseAsBoolean.withDefault(false)
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateLinkSchema>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      targetUserId: "",
      templateId: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateLinkSchema) => {
    setError(null);
    try {
      await createExerciseLink({
        targetUserId: values.targetUserId,
        templateId: Number(values.templateId),
      });
      toast.success("Enlace creado exitosamente!");
      setOpen(false);
      form.reset();
    } catch (e) {
      console.error(e);
      setError("Error al crear el enlace");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Crear enlace
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo enlace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-2 flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="targetUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para</FormLabel>
                  <FormControl>
                    <Select
                      items={users.map((u) => ({
                        value: u.id,
                        label: u.name || u.email,
                      }))}
                      onValueChange={field.onChange}
                      required
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {user.name || user.email}
                            </div>
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
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plantilla</FormLabel>
                  <FormControl>
                    <Select
                      items={templates.map((t) => ({
                        value: t.id.toString(),
                        label: t.title,
                      }))}
                      onValueChange={field.onChange}
                      required
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Clipboard className="h-4 w-4" />
                              {template.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creando..." : "Crear enlace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

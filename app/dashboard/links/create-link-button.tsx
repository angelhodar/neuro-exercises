"use client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { parseAsBoolean, useQueryState } from "nuqs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { createExerciseLink } from "@/app/actions/links";
import { Plus, User, Clipboard } from "lucide-react";

const createLinkSchema = z.object({
  targetUserId: z.string().min(1, "Selecciona un usuario"),
  templateId: z.string().min(1, "Selecciona una plantilla"),
});

type CreateLinkSchema = z.infer<typeof createLinkSchema>;

type CreateLinkButtonProps = {
  users: { id: string; name: string | null; email: string }[];
  templates: { id: number; title: string }[];
};

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
    <Dialog open={open} onOpenChange={setOpen}>
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <FormField
              control={form.control}
              name="targetUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
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
                      value={field.value}
                      onValueChange={field.onChange}
                      required
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creando..." : "Crear enlace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

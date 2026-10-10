"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { addMemberToOrganization } from "@/app/actions/organizations";
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

const addMemberSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  role: z.enum(["owner", "admin", "member"]),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberButtonProps {
  allowOwnerRole: boolean;
  organizationId: string;
}

export default function AddMemberButton({
  allowOwnerRole,
  organizationId,
}: AddMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMemberForm = useForm<AddMemberFormValues>({
    defaultValues: {
      email: "",
      role: "member",
    },
    resolver: zodResolver(addMemberSchema),
  });

  const onAddMemberSubmit = async (values: AddMemberFormValues) => {
    setIsLoading(true);
    try {
      const result = await addMemberToOrganization(
        values.email,
        values.role,
        organizationId
      );

      const error = result.error as string | undefined;
      if (error) {
        toast.error(`Error al agregar miembro: ${error}`);
        return;
      }

      toast.success("Miembro agregado exitosamente");
      addMemberForm.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error al agregar miembro:", error);
      toast.error("Error inesperado al agregar miembro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="h-4 w-4" />
        Añadir usuario
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir nuevo usuario a la organización</DialogTitle>
        </DialogHeader>
        <Form {...addMemberForm}>
          <form onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={addMemberForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del usuario</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addMemberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol en la organización</FormLabel>
                    <Select
                      defaultValue={field.value}
                      disabled={isLoading}
                      items={[
                        { label: "Miembro", value: "member" },
                        { label: "Administrador", value: "admin" },
                        ...(allowOwnerRole
                          ? [{ label: "Propietario", value: "owner" }]
                          : []),
                      ]}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Miembro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        {!!allowOwnerRole && (
                          <SelectItem value="owner">Propietario</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                {isLoading ? "Añadiendo..." : "Añadir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

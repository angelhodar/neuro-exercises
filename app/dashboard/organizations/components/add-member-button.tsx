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
import { authClient } from "@/lib/auth/auth.client";

const addMemberSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  role: z.enum(["owner", "admin", "member"]),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberButtonProps {
  organizationId: string;
}

export default function AddMemberButton({
  organizationId,
}: AddMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMemberForm = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onAddMemberSubmit = async (values: AddMemberFormValues) => {
    setIsLoading(true);
    try {
      // First, we need to find the user by email
      const users = await authClient.admin.listUsers({
        query: {
          searchValue: values.email,
          searchField: "email",
          searchOperator: "contains",
        },
      });

      if (users.error) {
        toast.error(`Error al buscar usuario: ${users.error}`);
        return;
      }

      const userList = users.data?.users || [];
      const user = userList.find((u) => u.email === values.email);

      if (!user) {
        toast.error("No se encontró un usuario con ese email");
        return;
      }

      // Add the user to the organization using the server action
      const result = await addMemberToOrganization(
        user.id,
        values.role,
        organizationId
      );

      if (result.error) {
        toast.error(`Error al agregar miembro: ${result.error}`);
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
                        <SelectItem value="owner">Propietario</SelectItem>
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

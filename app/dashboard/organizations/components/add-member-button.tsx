"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/auth.client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { addMemberToOrganization } from "@/app/actions/organizations";

const addMemberSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  role: z.enum(["owner", "admin", "member"]),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberButtonProps {
  organizationId: string;
}

export default function AddMemberButton({ organizationId }: AddMemberButtonProps) {
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
        toast.error("Error al buscar usuario: " + users.error);
        return;
      }

      const userList = users.data?.users || [];
      const user = userList.find(u => u.email === values.email);

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
        toast.error("Error al agregar miembro: " + result.error);
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
    <Dialog open={open} onOpenChange={setOpen}>
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
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        disabled={isLoading}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Añadiendo..." : "Añadir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
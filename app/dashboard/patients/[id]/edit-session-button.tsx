"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updatePatientSession } from "@/app/actions/patients";
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
import { Textarea } from "@/components/ui/textarea";
import type { PatientSession } from "@/lib/db/schema";
import {
  DISCIPLINE_LABELS,
  DISCIPLINES,
  SESSION_TYPE_LABELS,
  SESSION_TYPES,
} from "../constants";

const editSessionSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  type: z.string().min(1, "El tipo de sesión es obligatorio"),
  discipline: z.string().min(1, "La disciplina es obligatoria"),
  observations: z.string().optional(),
});

type EditSessionFormValues = z.infer<typeof editSessionSchema>;

interface EditSessionButtonProps {
  session: PatientSession;
  patientId: number;
}

export default function EditSessionButton({
  session,
  patientId,
}: EditSessionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditSessionFormValues>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      date: new Date(session.date).toISOString().split("T")[0],
      type: session.type,
      discipline: session.discipline,
      observations: session.observations || "",
    },
  });

  const onSubmit = async (data: EditSessionFormValues) => {
    setIsLoading(true);
    try {
      await updatePatientSession(session.id, patientId, {
        date: new Date(data.date),
        type: data.type,
        discipline: data.discipline,
        observations: data.observations || null,
      });
      toast.success("Sesión actualizada exitosamente");
      setOpen(false);
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Error al actualizar la sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar sesión</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de sesión *</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_TYPES.map((type) => (
                            <SelectItem
                              key={type}
                              label={SESSION_TYPE_LABELS[type]}
                              value={type}
                            >
                              {SESSION_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discipline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina *</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISCIPLINES.map((discipline) => (
                            <SelectItem
                              key={discipline}
                              label={DISCIPLINE_LABELS[discipline]}
                              value={discipline}
                            >
                              {DISCIPLINE_LABELS[discipline]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Observaciones de la sesión..."
                        rows={4}
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
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

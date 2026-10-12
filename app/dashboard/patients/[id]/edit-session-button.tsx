"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Form } from "@/components/ui/form";
import type { PatientSession } from "@/lib/db/schema";
import { SessionFormFields } from "../session-form-fields";
import {
  type SessionFormValues,
  sessionFormInput,
  sessionFormSchema,
} from "../session-form-schema";

export default function EditSessionButton({
  session,
  patientId,
}: {
  patientId: number;
  session: PatientSession;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SessionFormValues>({
    defaultValues: {
      date: new Date(session.date).toISOString().split("T")[0],
      discipline: session.discipline,
      observations: session.observations || "",
      type: session.type,
    },
    resolver: zodResolver(sessionFormSchema),
  });

  const onSubmit = async (data: SessionFormValues) => {
    setIsLoading(true);
    try {
      await updatePatientSession(session.id, patientId, sessionFormInput(data));
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
            <SessionFormFields disabled={isLoading} />
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

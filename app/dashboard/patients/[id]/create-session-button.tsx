"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPatientSession } from "@/app/actions/patients";
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
import { SessionFormFields } from "../session-form-fields";
import {
  type SessionFormValues,
  sessionFormInput,
  sessionFormSchema,
} from "../session-form-schema";

export default function CreateSessionButton({
  patientId,
}: {
  patientId: number;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SessionFormValues>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      discipline: "",
      observations: "",
      type: "",
    },
    resolver: zodResolver(sessionFormSchema),
  });

  const onSubmit = async (data: SessionFormValues) => {
    setIsLoading(true);
    try {
      await createPatientSession({ ...sessionFormInput(data), patientId });
      toast.success("Sesión creada exitosamente");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Error al crear la sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva sesión
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva sesión</DialogTitle>
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
                    Creando...
                  </>
                ) : (
                  "Crear sesión"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

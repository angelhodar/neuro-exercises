"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deletePatient } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Patient } from "@/lib/db/schema";

interface DeletePatientButtonProps {
  patient: Patient;
}

export default function DeletePatientButton({
  patient,
}: DeletePatientButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePatient(patient.id);
      toast.success("Paciente eliminado exitosamente");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Error al eliminar el paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar paciente</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar a {patient.firstName}{" "}
            {patient.lastName}? Se eliminarán también todas sus sesiones y
            tests. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

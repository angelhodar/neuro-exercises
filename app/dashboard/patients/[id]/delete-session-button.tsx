"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deletePatientSession } from "@/app/actions/patients";
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
import type { PatientSession } from "@/lib/db/schema";

interface DeleteSessionButtonProps {
  session: PatientSession;
  patientId: number;
}

export default function DeleteSessionButton({
  session,
  patientId,
}: DeleteSessionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePatientSession(session.id, patientId);
      toast.success("Sesión eliminada exitosamente");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Error al eliminar la sesión");
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
          <DialogTitle>Eliminar sesión</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se
            puede deshacer.
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

"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deletePatientTest } from "@/app/actions/patients";
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
import type { PatientTest } from "@/lib/db/schema";

interface DeleteTestButtonProps {
  test: PatientTest;
  patientId: number;
}

export default function DeleteTestButton({
  test,
  patientId,
}: DeleteTestButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePatientTest(test.id, patientId);
      toast.success("Test eliminado exitosamente");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Error al eliminar el test");
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
          <DialogTitle>Eliminar test</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar este test? Esta acción no se
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

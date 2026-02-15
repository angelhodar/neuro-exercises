"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSpeechText } from "@/app/actions/speech";
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

interface DeleteSpeechTextButtonProps {
  id: number;
  name: string;
}

export default function DeleteSpeechTextButton({
  id,
  name,
}: DeleteSpeechTextButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteSpeechText(id);
      toast.success("Texto de referencia eliminado exitosamente");
      setIsOpen(false);
    } catch (_error) {
      toast.error("Error al eliminar el texto de referencia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Texto de Referencia</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar el texto "{name}"? Esta acción
            no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={() => setIsOpen(false)}
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

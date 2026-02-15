"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExerciseLink } from "@/app/actions/links";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";

interface DeleteLinkButtonProps {
  linkId: number;
}

export function DeleteLinkButton({ linkId }: DeleteLinkButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "¿Estás seguro?",
      description:
        "Esta acción no se puede deshacer. El enlace dejará de funcionar y se perderán todos los datos asociados.",
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteExerciseLink(linkId);
      toast.success("Enlace eliminado exitosamente");
      // Recargar la página para mostrar los cambios
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el enlace");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      disabled={isDeleting}
      onClick={handleDelete}
      size="sm"
      variant="ghost"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Eliminar enlace</span>
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
}

export function DeleteOrganizationButton({
  organizationId,
  organizationName,
}: DeleteOrganizationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar la organización "${organizationName}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrganization(organizationId);
      router.refresh();
    } catch (error) {
      console.error("Error eliminando organización:", error);
      alert("Error al eliminar la organización");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

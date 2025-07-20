"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { Organization } from "@/lib/db/schema";

interface DeleteOrganizationButtonProps {
  organization: Organization;
}

export default function DeleteOrganizationButton({
  organization,
}: DeleteOrganizationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Eliminar organización",
      description: `¿Estás seguro de que quieres eliminar la organización "${organization.name}"? Esta acción no se puede deshacer.`,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteOrganization(organization.id);
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

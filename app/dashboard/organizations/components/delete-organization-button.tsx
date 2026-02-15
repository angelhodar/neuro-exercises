"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteOrganization } from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import type { Organization } from "@/lib/db/schema";

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

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrganization(organization.id);
      router.refresh();
    } catch (error) {
      console.error("Error eliminando organización:", error);
      toast.error("Error al eliminar la organización");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      disabled={isDeleting}
      onClick={handleDelete}
      size="sm"
      variant="outline"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

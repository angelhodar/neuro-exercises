import { Button } from "@/components/ui/button";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getOrganizationById } from "@/app/actions/organizations";
import { notFound } from "next/navigation";
import { EditOrganizationForm } from "./edit-organization-form";

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const organization = await getOrganizationById(resolvedParams.id);

  if (!organization) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/organizations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <DashboardHeaderTitle>Editar Organización</DashboardHeaderTitle>
            <DashboardHeaderDescription>
              Modifica la información de la organización.
            </DashboardHeaderDescription>
          </div>
        </div>
      </DashboardHeader>

      <EditOrganizationForm organization={organization} />
    </div>
  );
}

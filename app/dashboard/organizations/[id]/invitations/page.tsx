import { Button } from "@/components/ui/button";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { ArrowLeft, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { getOrganizationById } from "@/app/actions/organizations";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function OrganizationInvitationsPage({
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
        <div className="space-y-2">
          <DashboardHeaderTitle>Invitaciones</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona las invitaciones para {organization.name}.
          </DashboardHeaderDescription>
        </div>
        <Button asChild>
          <Link
            href={`/dashboard/organizations/${resolvedParams.id}/invitations/create`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Enviar Invitación
          </Link>
        </Button>
      </DashboardHeader>

      <Card>
        <CardContent className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.invitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invitation.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        new Date(invitation.expiresAt) < new Date()
                          ? "destructive"
                          : "default"
                      }
                    >
                      {new Date(invitation.expiresAt) < new Date()
                        ? "Expirada"
                        : "Activa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(String(invitation.expiresAt))}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(String(invitation.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Reenviar
                      </Button>
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!organization.invitations ||
                organization.invitations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se han enviado invitaciones aún
                      </p>
                      <Button asChild>
                        <Link
                          href={`/dashboard/organizations/${resolvedParams.id}/invitations/create`}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Enviar primera invitación
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

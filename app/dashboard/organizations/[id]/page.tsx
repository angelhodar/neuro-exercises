import {
  getOrgMembers,
  getOrganizationById,
} from "@/app/actions/organizations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Mail, Users } from "lucide-react";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
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
import Link from "next/link";
import { notFound } from "next/navigation";
import AddMemberButton from "../components/add-member-button";
import EditOrganizationButton from "../components/edit-organization-button";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  const [organization, members] = await Promise.all([
    getOrganizationById(resolvedParams.id),
    getOrgMembers(resolvedParams.id),
  ]);

  if (!organization) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="space-y-2">
          <DashboardHeaderTitle>{organization.name}</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona los miembros y configuraciones de {organization.name}.
          </DashboardHeaderDescription>
        </div>
        <div className="flex items-center gap-2">
          <EditOrganizationButton organization={organization}>
            <Edit className="h-4 w-4" />
            Editar
          </EditOrganizationButton>
          <AddMemberButton organizationId={resolvedParams.id} />
          {/*<Button variant="outline" asChild>
            <Link
              href={`/dashboard/organizations/${resolvedParams.id}/invitations`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Invitaciones
            </Link>
          </Button>*/}
        </div>
      </DashboardHeader>

      <Card>
        <CardContent className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.user.name}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(String(member.user.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay miembros en esta organización
                      </p>
                      <Button asChild>
                        <Link
                          href={`/dashboard/organizations/${resolvedParams.id}/invitations`}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Invitar miembros
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

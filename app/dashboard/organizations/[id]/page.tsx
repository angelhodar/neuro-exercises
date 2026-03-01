import { Edit, Mail, User, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrganizationById,
  getOrgMembers,
} from "@/app/actions/organizations";
import {
  DashboardHeader,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
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

  if (!organization) {
    notFound();
  }

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
          {/*<Button variant="outline" render={<Link
              href={`/dashboard/organizations/${resolvedParams.id}/invitations`}
            />}>
              <Mail className="mr-2 h-4 w-4" />
              Invitaciones
          </Button>*/}
        </div>
      </DashboardHeader>

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
                  <TableCell className="py-8 text-center" colSpan={6}>
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay miembros en esta organización
                      </p>
                      <Button
                        render={
                          <Link
                            href={`/dashboard/organizations/${resolvedParams.id}/invitations`}
                          />
                        }
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Invitar miembros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
      </Table>
    </div>
  );
}

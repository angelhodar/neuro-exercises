import { getAllOrganizations } from "@/app/actions/organizations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Building2, Users, Mail, Calendar, Edit } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DeleteOrganizationButton from "./components/delete-organization-button";
import CreateOrganizationButton from "./components/create-organization-button";
import EditOrganizationButton from "./components/edit-organization-button";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const organizations = await getAllOrganizations();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Organizaciones</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona las organizaciones y sus miembros.
          </DashboardHeaderDescription>
        </div>
        <CreateOrganizationButton />
      </DashboardHeader>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Invitaciones</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{org.members?.length || 0} miembros</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{org.invitations?.length || 0} invitaciones</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(String(org.createdAt))}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" render={<Link href={`/dashboard/organizations/${org.id}`} />}>
                          <Users className="h-4 w-4" />
                      </Button>
                      <EditOrganizationButton
                        organization={org}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </EditOrganizationButton>
                      {/*<Button variant="outline" size="sm" render={<Link href={`/dashboard/organizations/${org.id}/invitations`} />}>
                          <Mail className="h-4 w-4" />
                      </Button>*/}
                      <DeleteOrganizationButton organization={org} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay organizaciones creadas
                      </p>
                      <CreateOrganizationButton />
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

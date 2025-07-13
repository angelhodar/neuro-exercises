import { getOrgMembers, getOrganizationById } from "@/app/actions/organizations";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";
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

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const members = await getOrgMembers(org);
  const organization = org ? await getOrganizationById(org) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>
            {organization ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Miembros de {organization.name}
                <Badge variant="outline">{organization.slug}</Badge>
              </div>
            ) : (
              "Miembros"
            )}
          </DashboardHeaderTitle>
          <DashboardHeaderDescription>
            {organization
              ? `Gestiona los miembros de la organización ${organization.name}.`
              : "Gestiona y visualiza todos los miembros de las organizaciones."}
          </DashboardHeaderDescription>
        </div>
      </DashboardHeader>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={`${member.user.id}-${member.organization.name}`}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{member.organization.name}</span>
                      {member.organization.slug && (
                        <Badge variant="outline" className="text-xs">
                          {member.organization.slug}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(String(member.user.createdAt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

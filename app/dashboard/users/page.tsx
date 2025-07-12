import { getAvailableUsers } from "@/app/actions/users";
import { getOrganizationById } from "@/app/actions/organizations";
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
  const users = await getAvailableUsers(org);
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
              "Usuarios"
            )}
          </DashboardHeaderTitle>
          <DashboardHeaderDescription>
            {organization
              ? `Gestiona los miembros de la organización ${organization.name}.`
              : "Gestiona y visualiza el progreso de los usuarios."}
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
                <TableHead>Fecha de creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(String(user.createdAt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

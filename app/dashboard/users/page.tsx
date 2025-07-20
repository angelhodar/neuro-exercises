import { getUsers } from "@/app/actions/users";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";
import AddUserButton from "./add-user-button";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <DashboardHeaderTitle>Usuarios</DashboardHeaderTitle>
            <DashboardHeaderDescription>
              Gestiona y visualiza todos los usuarios de la plataforma
            </DashboardHeaderDescription>
          </div>
          <AddUserButton />
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
                <TableHead>Organizaciones</TableHead>
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
                  <TableCell>
                    {user.memberships && user.memberships.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {user.memberships[0].organization.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin organizaciones</span>
                    )}
                  </TableCell>
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

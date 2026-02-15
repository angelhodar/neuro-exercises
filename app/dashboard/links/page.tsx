import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, LinkIcon, Target } from "lucide-react";
import Link from "next/link";
import { getUserExerciseLinks } from "@/app/actions/links";
import { getExerciseTemplates } from "@/app/actions/templates";
import { getAvailableUsers } from "@/app/actions/users";
import {
  DashboardHeader,
  DashboardHeaderActions,
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
import { CopyLinkButton } from "./copy-link-button";
import CreateLinkButton from "./create-link-button";
import { DeleteLinkButton } from "./delete-link-button";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

// Componente para mostrar información del usuario objetivo
function TargetUserInfo({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <Target className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{name || email}</p>
        {name && (
          <p className="truncate text-muted-foreground text-xs">{email}</p>
        )}
      </div>
    </div>
  );
}

export default async function LinksPage() {
  const [links, users, templates] = await Promise.all([
    getUserExerciseLinks(),
    getAvailableUsers(),
    getExerciseTemplates(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Enlaces de ejercicios</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona y comparte ejercicios con tus usuarios.
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <CreateLinkButton templates={templates} users={users} />
        </DashboardHeaderActions>
      </DashboardHeader>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <LinkIcon className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-lg">No hay enlaces creados</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Comienza creando tu primer enlace compartido para enviar ejercicios
            a tus usuarios.
          </p>
          <CreateLinkButton templates={templates} users={users} />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Ejercicios</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        {link.template?.title}
                      </p>
                      {link.template?.description && (
                        <p className="line-clamp-2 text-muted-foreground text-sm">
                          {link.template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TargetUserInfo
                      email={link.targetUser?.email || ""}
                      name={link.targetUser?.name || ""}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {link.template?.exerciseTemplateItems?.length || 0}{" "}
                        ejercicios
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <time
                      className="text-muted-foreground text-sm"
                      dateTime={link.createdAt.toString()}
                    >
                      {format(new Date(link.createdAt), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </time>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CopyLinkButton token={link.token} />
                      <Button
                        className="h-8 w-8 p-0"
                        render={
                          <Link href={`/s/${link.token}`} target="_blank" />
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Abrir enlace</span>
                      </Button>
                      <DeleteLinkButton linkId={link.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

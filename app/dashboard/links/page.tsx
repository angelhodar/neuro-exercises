import Link from "next/link";
import { ExternalLink, MoreHorizontal, Target, LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
  DashboardHeaderActions,
} from "@/components/dashboard-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyLinkButton } from "./copy-link-button";
import { LinkActionsDropdown } from "./link-actions-dropdown";
import { getUserExerciseLinks } from "@/app/actions/links";
import { getAvailableUsers } from "@/app/actions/users";
import { getExerciseTemplates } from "@/app/actions/templates";
import CreateLinkButton from "./create-link-button";

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
        <p className="truncate text-sm font-medium">{name || email}</p>
        {name && (
          <p className="truncate text-xs text-muted-foreground">{email}</p>
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
          <CreateLinkButton users={users} templates={templates} />
        </DashboardHeaderActions>
      </DashboardHeader>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <LinkIcon className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No hay enlaces creados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza creando tu primer enlace compartido para enviar ejercicios
            a tus usuarios.
          </p>
          <CreateLinkButton users={users} templates={templates} />
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
              {links.map((link: any) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        {link.template?.title}
                      </p>
                      {link.template?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {link.template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TargetUserInfo
                      name={link.targetUser?.name || ""}
                      email={link.targetUser?.email || ""}
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
                      dateTime={link.createdAt.toString()}
                      className="text-sm text-muted-foreground"
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
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <Link href={`/s/${link.token}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Abrir enlace</span>
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/s/${link.token}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Abrir enlace
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <LinkActionsDropdown linkId={link.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
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

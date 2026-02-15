import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { getExerciseTemplates } from "@/app/actions/templates";
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

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getExerciseTemplates();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Plantillas de ejercicios</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Crea conjuntos de ejercicios personalizados
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <Button render={<Link href="/dashboard/templates/create" />}>
            <Plus className="mr-2 h-4 w-4" />
            Crear plantilla
          </Button>
        </DashboardHeaderActions>
      </DashboardHeader>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-lg">
            No hay plantillas creadas
          </h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Comienza creando tu primera plantilla de ejercicios.
          </p>
          <Link className="mt-4" href="/dashboard/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear primera plantilla
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Creador</TableHead>
                <TableHead>Ejercicios</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium leading-none">
                      {template.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-2 text-muted-foreground text-sm">
                      {template.description || "Sin descripción"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="truncate font-medium text-sm">
                        {template.creator?.name || template.creator?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {template.exerciseTemplateItems?.length || 0} ejercicios
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <time
                      className="text-muted-foreground text-sm"
                      dateTime={template.createdAt.toString()}
                    >
                      {format(new Date(template.createdAt), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </time>
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

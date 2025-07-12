import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/organizations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <DashboardHeaderTitle>
              Organización no encontrada
            </DashboardHeaderTitle>
            <DashboardHeaderDescription>
              La organización que buscas no existe o ha sido eliminada.
            </DashboardHeaderDescription>
          </div>
        </div>
      </DashboardHeader>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Organización no encontrada
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            La organización que intentas acceder no existe o ha sido eliminada.
          </p>
          <Button asChild>
            <Link href="/dashboard/organizations">
              Ver todas las organizaciones
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

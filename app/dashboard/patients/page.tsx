import { Calendar, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { getPatients } from "@/app/actions/patients";
import {
  DashboardHeader,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import CreatePatientButton from "./components/create-patient-button";
import DeletePatientButton from "./components/delete-patient-button";
import EditPatientButton from "./components/edit-patient-button";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const patientList = await getPatients();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Pacientes</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona los pacientes y sus sesiones de terapia.
          </DashboardHeaderDescription>
        </div>
        <CreatePatientButton />
      </DashboardHeader>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientList.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.firstName}
                  </TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>
                    {patient.dateOfBirth ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(String(patient.dateOfBirth))}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.phone}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1 max-w-xs">
                      {patient.diagnosis || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        render={
                          <Link href={`/dashboard/patients/${patient.id}`} />
                        }
                        size="sm"
                        variant="outline"
                      >
                        <UserRound className="h-4 w-4" />
                      </Button>
                      <EditPatientButton patient={patient} />
                      <DeletePatientButton patient={patient} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {patientList.length === 0 && (
                <TableRow>
                  <TableCell className="py-8 text-center" colSpan={6}>
                    <div className="flex flex-col items-center gap-2">
                      <UserRound className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay pacientes registrados
                      </p>
                      <CreatePatientButton />
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

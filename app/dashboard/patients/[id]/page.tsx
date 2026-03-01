import { ArrowLeft, Calendar, ClipboardList, TestTube2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientById } from "@/app/actions/patients";
import {
  DashboardHeader,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import {
  DISCIPLINE_LABELS,
  EVALUATED_PROCESS_LABELS,
  SESSION_TYPE_LABELS,
} from "../constants";
import CreateSessionButton from "./create-session-button";
import CreateTestButton from "./create-test-button";
import DeleteSessionButton from "./delete-session-button";
import DeleteTestButton from "./delete-test-button";
import EditSessionButton from "./edit-session-button";
import EditTestButton from "./edit-test-button";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatientById(Number(id));

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex items-center gap-4">
          <Button
            render={<Link href="/dashboard/patients" />}
            size="sm"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <DashboardHeaderTitle>
              {patient.firstName} {patient.lastName}
            </DashboardHeaderTitle>
            {patient.diagnosis && (
              <DashboardHeaderDescription>
                {patient.diagnosis}
              </DashboardHeaderDescription>
            )}
          </div>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">
            <ClipboardList className="mr-2 h-4 w-4" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="tests">
            <TestTube2 className="mr-2 h-4 w-4" />
            Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Sesiones</h3>
              <CreateSessionButton patientId={patient.id} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.patientSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(String(session.date))}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {SESSION_TYPE_LABELS[session.type] || session.type}
                    </TableCell>
                    <TableCell>
                      {DISCIPLINE_LABELS[session.discipline] ||
                        session.discipline}
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 max-w-xs">
                        {session.observations || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <EditSessionButton
                          patientId={patient.id}
                          session={session}
                        />
                        <DeleteSessionButton
                          patientId={patient.id}
                          session={session}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {patient.patientSessions.length === 0 && (
                  <TableRow>
                    <TableCell className="py-8 text-center" colSpan={5}>
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No hay sesiones registradas
                        </p>
                        <CreateSessionButton patientId={patient.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Tests</h3>
              <CreateTestButton patientId={patient.id} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proceso evaluado</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.patientTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(String(test.date))}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {EVALUATED_PROCESS_LABELS[test.evaluatedProcess] ||
                        test.evaluatedProcess}
                    </TableCell>
                    <TableCell>
                      {test.testName || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {test.score || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 max-w-xs">
                        {test.observations || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <EditTestButton patientId={patient.id} test={test} />
                        <DeleteTestButton patientId={patient.id} test={test} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {patient.patientTests.length === 0 && (
                  <TableRow>
                    <TableCell className="py-8 text-center" colSpan={6}>
                      <div className="flex flex-col items-center gap-2">
                        <TestTube2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No hay tests registrados
                        </p>
                        <CreateTestButton patientId={patient.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { getSpeechTexts } from "@/app/actions/speech";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { formatDate } from "@/lib/utils";
import CreateSpeechTextButton from "./create-speech-text-button";
import EditSpeechTextButton from "./edit-speech-text-button";
import DeleteSpeechTextButton from "./delete-speech-text-button";

export const dynamic = "force-dynamic";

export default async function SpeechTextsPage() {
  const speechTexts = await getSpeechTexts();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-2">
            <DashboardHeaderTitle>Textos de referencia</DashboardHeaderTitle>
            <DashboardHeaderDescription>
              Gestiona tus textos de referencia para ejercicios de
              reconocimiento de voz
            </DashboardHeaderDescription>
          </div>
          <CreateSpeechTextButton />
        </div>
      </DashboardHeader>

      <Card>
        <CardContent className="mt-4">
          {speechTexts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay textos de referencia. Crea uno nuevo para empezar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Texto</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speechTexts.map((text) => (
                  <TableRow key={text.id}>
                    <TableCell className="font-medium">{text.name}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-xs truncate cursor-help">
                            {text.referenceText}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="whitespace-pre-wrap">
                            {text.referenceText}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(String(text.createdAt))}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditSpeechTextButton speechText={text} />
                        <DeleteSpeechTextButton id={text.id} name={text.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

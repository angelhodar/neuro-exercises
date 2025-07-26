import { getTranscriptionResults } from "@/app/actions/speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/app/dashboard/dashboard-header";
import { formatDate, createBlobUrl } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";

export default async function SpeechTranscriptionsPage() {
  const transcriptions = await getTranscriptionResults();

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-100 text-green-800";
    if (accuracy >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex flex-col gap-2">
          <DashboardHeaderTitle>Transcripciones</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Historial de ejercicios de reconocimiento de voz realizados
          </DashboardHeaderDescription>
        </div>
      </DashboardHeader>

      <Card>
        <CardContent className="mt-4">
          {transcriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay transcripciones registradas. Realiza un ejercicio de reconocimiento de voz para empezar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Texto</TableHead>
                  <TableHead>Transcripción</TableHead>
                  <TableHead>Precisión</TableHead>
                  <TableHead>Palabras</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Audio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcriptions.map((transcription) => (
                  <TableRow key={transcription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transcription.referenceText.name}</div>
                        {transcription.referenceText.referenceText && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {transcription.referenceText.referenceText}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{transcription.referenceText.referenceText}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-xs truncate">
                            {transcription.transcribedText}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{transcription.transcribedText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccuracyColor(transcription.accuracy)}>
                        {transcription.accuracy}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-2 text-sm">
                        <div className="text-green-600">✓ {transcription.matchingWords}</div>
                        <div className="text-red-600">✗ {transcription.nonMatchingWords}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(String(transcription.createdAt))}</TableCell>
                    <TableCell>
                      <audio 
                        controls 
                        className="h-10"
                        src={createBlobUrl(transcription.audioBlobKey)}
                      >
                        Tu navegador no soporta el elemento de audio.
                      </audio>
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
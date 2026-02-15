"use client";

import { BarChart3, CheckCircle, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createTranscriptionResult } from "@/app/actions/speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { uploadBlobFromFile } from "@/lib/storage";
import { getDiff } from "@/lib/utils";
import { AudioRecorder } from "./audio-recorder";
import { DiffViewer } from "./diff-viewer";

export default function SpeechRecognitionClient() {
  const [referenceText, setReferenceText] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTranscriptionComplete = (text: string, blob: Blob) => {
    setTranscribedText(text);
    setAudioBlob(blob);
  };

  // Calculate diff result when both texts are available
  const diffResult = useMemo(() => {
    if (!(referenceText && transcribedText)) {
      return null;
    }
    return getDiff(referenceText, transcribedText);
  }, [referenceText, transcribedText]);

  const saveTranscriptionResult = async () => {
    if (!(transcribedText && referenceText && diffResult && audioBlob)) {
      toast.error("Faltan datos para guardar el resultado");
      return;
    }

    setIsSaving(true);

    try {
      // Convert Blob to File for upload
      const audioFile = new File([audioBlob], "audio-recording.wav", {
        type: audioBlob.type || "audio/wav",
      });

      // Upload audio blob to storage
      const blob = await uploadBlobFromFile(audioFile, "speech");
      const audioBlobKey = blob.pathname;

      await createTranscriptionResult({
        referenceText,
        transcribedText,
        audioBlobKey,
        accuracy: Math.round(diffResult.accuracy),
        matchingWords: diffResult.matches,
        nonMatchingWords: diffResult.differences,
      });

      toast.success("Resultado guardado exitosamente");

      // Reset form
      setReferenceText("");
      setTranscribedText("");
      setAudioBlob(null);
    } catch (error) {
      console.error("Error saving transcription result:", error);
      toast.error("Error al guardar el resultado");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Textarea
          className="min-h-[200px]"
          id="reference-text"
          onChange={(e) => setReferenceText(e.target.value)}
          placeholder="Escribe aquí el texto de referencia"
          value={referenceText || ""}
        />

        <Card>
          <CardHeader>
            <CardTitle>Grabación de audio</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
            />
          </CardContent>
        </Card>
      </div>

      {transcribedText && diffResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* KPIs Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-600 text-sm">
                        Precisión
                      </p>
                      <p className="font-bold text-3xl text-blue-700">
                        {diffResult.accuracy.toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-600 text-sm">
                        Coincidencias
                      </p>
                      <p className="font-bold text-3xl text-green-700">
                        {diffResult.matches}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600 text-sm">
                        Diferencias
                      </p>
                      <p className="font-bold text-3xl text-red-700">
                        {diffResult.differences}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diff Visualization */}
            <DiffViewer diffWords={diffResult.diffWords} />

            {referenceText && audioBlob && (
              <div className="flex justify-end border-t pt-4">
                <Button
                  className="ml-auto"
                  disabled={isSaving}
                  onClick={saveTranscriptionResult}
                >
                  {isSaving ? "Guardando..." : "Guardar resultado"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

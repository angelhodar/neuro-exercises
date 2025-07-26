"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { AudioRecorder } from "./audio-recorder";
import { DiffViewer } from "./diff-viewer";
import { createTranscriptionResult } from "@/app/actions/speech";
import { uploadBlobFromFile } from "@/lib/storage";
import { getDiff } from "@/lib/utils";
import { toast } from "sonner";

export default function SpeechRecognitionClient() {
  const [referenceText, setReferenceText] = useQueryState(
    "reference",
    parseAsString.withDefault(""),
  );
  const [transcribedText, setTranscribedText] = useQueryState(
    "transcription",
    parseAsString.withDefault(""),
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTranscriptionComplete = (text: string, blob: Blob) => {
    setTranscribedText(text);
    setAudioBlob(blob);
  };

  // Calculate diff result when both texts are available
  const diffResult = useMemo(() => {
    if (!referenceText || !transcribedText) return null;
    return getDiff(referenceText, transcribedText);
  }, [referenceText, transcribedText]);

  const saveTranscriptionResult = async () => {
    if (!transcribedText || !referenceText || !diffResult || !audioBlob) {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Textarea
          id="reference-text"
          value={referenceText || ""}
          onChange={(e) => setReferenceText(e.target.value)}
          className="min-h-[200px]"
          placeholder="Escribe aquí el texto de referencia"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Precisión
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {diffResult.accuracy.toFixed(2)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Coincidencias
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        {diffResult.matches}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Diferencias
                      </p>
                      <p className="text-3xl font-bold text-red-700">
                        {diffResult.differences}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diff Visualization */}
            <DiffViewer diffWords={diffResult.diffWords} />

            {referenceText && audioBlob && (
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={saveTranscriptionResult}
                  disabled={isSaving}
                  className="ml-auto"
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

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Play, Square, RotateCcw } from "lucide-react";
import { transcribeAudio } from "@/app/actions/speech-recognition";
import { DiffViewer } from "./diff-viewer";

export default function SpeechRecognitionPage() {
  const [referenceText, setReferenceText] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        
        // Create audio URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert("Please record audio first");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      const result = await transcribeAudio(formData);
      setTranscribedText(result.text);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Error transcribing audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRerecord = () => {
    setTranscribedText("");
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio URL and timers when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [audioUrl]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reconocimiento de Voz</h1>
          <p className="text-muted-foreground">
            Prueba la precisión del reconocimiento de voz comparando texto de referencia con transcripción
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Texto de referencia */}
        <Card>
          <CardHeader>
            <CardTitle>Texto de Referencia</CardTitle>
            <CardDescription>
              Escribe el texto que vas a pronunciar durante la grabación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Escribe aquí el texto de referencia..."
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        {/* Controles de grabación */}
        <Card>
          <CardHeader>
            <CardTitle>Grabación de Audio</CardTitle>
            <CardDescription>
              Graba tu voz leyendo el texto de referencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Iniciar Grabación
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Detener Grabación
              </Button>
            </div>

            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span>Grabando... {formatTime(recordingDuration)}</span>
              </div>
            )}

            {audioBlob && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Play className="h-4 w-4" />
                  Audio grabado correctamente
                </div>
                
                {/* Audio Player */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Escucha tu grabación antes de transcribir:
                  </span>
                  
                  {/* Native audio player */}
                  {audioUrl && (
                    <audio
                      src={audioUrl}
                      controls
                      className="w-full"
                    />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? "Transcribiendo..." : "Transcribir"}
                  </Button>
                  <Button
                    onClick={handleRerecord}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Grabar de nuevo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultados de transcripción */}
      {transcribedText && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Transcripción</CardTitle>
            <CardDescription>
              Comparación entre el texto de referencia y la transcripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Texto Transcrito:</h4>
                <div className="p-3 bg-muted rounded-md">
                  {transcribedText}
                </div>
              </div>
              
              {referenceText && (
                <div>
                  <h4 className="font-medium mb-2">Comparación:</h4>
                  <DiffViewer
                    original={referenceText}
                    modified={transcribedText}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
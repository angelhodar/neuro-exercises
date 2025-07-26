import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, RotateCcw, Upload, FileAudio } from "lucide-react";
import { transcribeAudio } from "@/app/actions/speech";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, audioBlob: Blob) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  // Generar URL dinámicamente a partir del blob
  const audioUrl = useMemo(() => {
    if (!audioBlob) return null;
    const url = URL.createObjectURL(audioBlob);
    return url;
  }, [audioBlob]);

  // Limpiar URL cuando cambie el blob
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const resetState = () => {
    setAudioBlob(null);
    setFileName("");
    setRecordingDuration(0);
    setIsRecording(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      resetState();
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
        setFileName("");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert("Please select an audio file");
        return;
      }
      resetState();
      setAudioBlob(file);
      setFileName(file.name);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert("Please record audio or upload an audio file first");
      return;
    }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, fileName || "data.wav");
      const result = await transcribeAudio(formData);
      onTranscriptionComplete(result.text, audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Error transcribing audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording and Upload Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {!isRecording && (
            <>
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Iniciar Grabación
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir Audio
              </Button>
            </>
          )}
          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Detener Grabación
            </Button>
          )}
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span>Grabando... {formatTime(recordingDuration)}</span>
          </div>
        )}
      </div>

      {/* Audio Display and Controls */}
      {audioBlob && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <FileAudio className="h-4 w-4" />
            {fileName ? `Archivo: ${fileName}` : "Audio grabado correctamente"}
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Escucha tu audio antes de transcribir:
            </span>
            {audioUrl && (
              <audio src={audioUrl} controls className="w-full" />
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
              onClick={resetState}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {fileName ? "Cambiar archivo" : "Grabar de nuevo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 
"use client";

import { useState, useRef, Fragment } from "react";
import { Volume2, Pause } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

interface ExerciseAudioButtonProps extends ButtonProps {
  audioSrc?: string;
}

export function ExerciseAudioButton({ audioSrc }: ExerciseAudioButtonProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!audioSrc) return null;

  const handleToggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  return (
    <Fragment>
      <Button
        size="lg"
        onClick={handleToggleAudio}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
      >
        {isPlayingAudio ? (
          <>
            <Pause className="w-6 h-6 mr-2" />
            <span>Pausar</span>
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6 mr-2" />
            <span>Instrucciones</span>
          </>
        )}
      </Button>

      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none">
        <source src={audioSrc} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </Fragment>
  );
}

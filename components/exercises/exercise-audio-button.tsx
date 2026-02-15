"use client";

import { Pause, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ExerciseAudioButtonProps extends ButtonProps {
  audioSrc?: string;
}

export function ExerciseAudioButton({ audioSrc }: ExerciseAudioButtonProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!audioSrc) {
    return null;
  }

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
    <>
      <Button
        className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
        onClick={handleToggleAudio}
        size="lg"
      >
        {isPlayingAudio ? (
          <>
            <Pause className="mr-2 h-6 w-6" />
            <span>Pausar</span>
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-6 w-6" />
            <span>Instrucciones</span>
          </>
        )}
      </Button>

      {/* biome-ignore lint/a11y/useMediaCaption: exercise audio instructions do not have captions available */}
      <audio onEnded={handleAudioEnded} preload="none" ref={audioRef}>
        <source src={audioSrc} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </>
  );
}

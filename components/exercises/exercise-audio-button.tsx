"use client";

import { useState, useRef, Fragment } from "react";
import { Volume2, Pause } from "lucide-react";
import { FloatingBarButton } from "./exercise-floating-bar";

interface ExerciseAudioButtonProps {
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
      <FloatingBarButton onClick={handleToggleAudio}>
        {isPlayingAudio ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </FloatingBarButton>

      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none">
        <source src={audioSrc} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </Fragment>
  );
}

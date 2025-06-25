"use client"

import { useState, useRef, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Pause } from "lucide-react"

interface ExerciseAudioButtonProps {
  audioSrc?: string
}

export function ExerciseAudioButton({ audioSrc }: ExerciseAudioButtonProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!audioSrc) return null

  const handleToggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause()
        setIsPlayingAudio(false)
      } else {
        audioRef.current.play()
        setIsPlayingAudio(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlayingAudio(false)
  }

  return (
    <Fragment>
      <Button
        variant="outline"
        size="lg"
        onClick={handleToggleAudio}
        className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        {isPlayingAudio ? (
          <>
            <Pause className="w-5 h-5 mr-2" />
            Pausar Instrucciones
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5 mr-2" />
            Reproducir Instrucciones
          </>
        )}
      </Button>

      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none">
        <source src={audioSrc} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </Fragment>
  )
}

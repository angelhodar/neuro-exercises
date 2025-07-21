"use client"

import type React from "react"
import { useRef } from "react"
import { MediaControls } from "./media-controls"

type MediaAudioProps = React.AudioHTMLAttributes<HTMLAudioElement>

export function MediaAudio({ children, ...audioProps }: MediaAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  return (
    <>
      {children}
      <MediaControls mediaRef={audioRef} />
      <audio ref={audioRef} {...audioProps} />
    </>
  )
}

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { MediaControls } from "./media-controls"

type MediaVideoProps = React.VideoHTMLAttributes<HTMLVideoElement>

export function MediaVideo({ children, className, ...videoProps }: MediaVideoProps) {
  const [showThumbnail, setShowThumbnail] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setShowThumbnail(false)
  }

  const handleEnded = () => {
    setShowThumbnail(true)
  }

  return (
    <>
      {/* Thumbnail/Children */}
      {showThumbnail && children}

      {/* Video Element */}
      <video
        ref={videoRef}
        className={cn("w-full h-full object-cover", showThumbnail ? "hidden" : "block", className)}
        {...videoProps}
      />

      <MediaControls mediaRef={videoRef} onPlay={handlePlay} onEnded={handleEnded} />
    </>
  )
}

"use client"

import type React from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"

interface MediaControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  mediaRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function MediaControls({ mediaRef, onPlay, onPause, onEnded, className, ...props }: MediaControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const getMediaType = useCallback(() => {
    const media = mediaRef.current
    if (!media) return "unknown"
    return media instanceof HTMLVideoElement ? "video" : "audio"
  }, [mediaRef])

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const updateTime = () => setCurrentTime(media.currentTime)
    const updateDuration = () => setDuration(media.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    media.addEventListener("timeupdate", updateTime)
    media.addEventListener("loadedmetadata", updateDuration)
    media.addEventListener("ended", handleEnded)

    return () => {
      media.removeEventListener("timeupdate", updateTime)
      media.removeEventListener("loadedmetadata", updateDuration)
      media.removeEventListener("ended", handleEnded)
    }
  }, [mediaRef, onEnded])

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event from bubbling to Selectable
      const media = mediaRef.current
      if (!media) return

      if (isPlaying) {
        media.pause()
        onPause?.()
      } else {
        media.play()
        onPlay?.()
      }
      setIsPlaying(!isPlaying)
    },
    [isPlaying, mediaRef, onPlay, onPause],
  )

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event from bubbling to Selectable
      const media = mediaRef.current
      if (!media) return

      media.muted = !isMuted
      setIsMuted(!isMuted)
    },
    [isMuted, mediaRef],
  )

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation() // Prevent event from bubbling to Selectable
      const media = mediaRef.current
      if (!media) return

      const newTime = Number.parseFloat(e.target.value)
      media.currentTime = newTime
      setCurrentTime(newTime)
    },
    [mediaRef],
  )

  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent any clicks in the controls area from bubbling
  }

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  const mediaType = getMediaType()

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className,
      )}
      onClick={handleControlsClick}
      {...props}
    >
      <div className="flex items-center gap-3 text-white">
        <button
          onClick={togglePlay}
          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          aria-label={isPlaying ? `Pause ${mediaType}` : `Play ${mediaType}`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`${mediaType} progress`}
          />
        </div>

        <span className="text-xs font-mono" aria-live="polite">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          onClick={toggleMute}
          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          aria-label={isMuted ? `Unmute ${mediaType}` : `Mute ${mediaType}`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MediaCardAudioProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function MediaCardAudio({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className 
}: MediaCardAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div 
      className={cn(
        "relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center",
        className
      )}
      style={{ width, height }}
    >
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      {/* Audio waveform visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end gap-1 h-16">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 bg-white/80 rounded-full transition-all duration-300",
                isPlaying ? "animate-pulse" : ""
              )}
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Play/Pause button */}
      <Button
        onClick={togglePlay}
        size="lg"
        className="absolute z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        variant="ghost"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 text-white" />
        ) : (
          <Play className="h-6 w-6 text-white ml-1" />
        )}
      </Button>

      {/* Volume controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2">
        <Button
          onClick={toggleMute}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
        >
          {isMuted ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={1}
          step={0.1}
          className="flex-1"
        />
      </div>

      {/* Audio icon overlay */}
      <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full p-1">
        <Volume2 className="h-4 w-4 text-white" />
      </div>
    </div>
  );
} 
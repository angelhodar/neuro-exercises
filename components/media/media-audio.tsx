"use client";

import type React from "react";

type MediaAudioProps = React.AudioHTMLAttributes<HTMLAudioElement>;

export function MediaAudio({ children, ...audioProps }: MediaAudioProps) {
  return (
    <div className="relative w-full h-full">
      {children}
      <audio {...audioProps} className="absolute bottom-2 w-full" controls />
    </div>
  );
}

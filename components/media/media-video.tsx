"use client";

import type React from "react";
import { cn } from "@/lib/utils";

type MediaVideoProps = React.VideoHTMLAttributes<HTMLVideoElement>;

export function MediaVideo({
  children,
  className,
  ...videoProps
}: MediaVideoProps) {
  return (
    <video
      {...videoProps}
      className={cn("w-full h-full object-cover block", className)}
      controls
    />
  );
}

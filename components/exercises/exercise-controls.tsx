"use client"

import { PropsWithChildren } from "react";

export function ExerciseControls({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-wrap gap-3 justify-center items-center flex-shrink-0 pt-6">
      {children}
    </div>
  )
}

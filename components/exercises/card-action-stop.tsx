"use client";

import type { PropsWithChildren } from "react";

export function CardActionStop({ children }: PropsWithChildren) {
  return (
    // biome-ignore lint/a11y/useKeyboardEvents: only prevents parent link navigation
    <div className="z-10" onClick={(e) => e.preventDefault()}>
      {children}
    </div>
  );
}

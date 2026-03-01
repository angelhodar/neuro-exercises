"use client";

import { cn } from "@/lib/utils";

export function CardActionStop({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: only prevents parent link navigation
    // biome-ignore lint/a11y/noStaticElementInteractions: only prevents parent link navigation
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: only prevents parent link navigation
    <div className={cn("z-10", className)} onClick={(e) => e.preventDefault()}>
      {children}
    </div>
  );
}

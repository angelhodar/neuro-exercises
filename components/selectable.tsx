"use client";

import type React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SelectableProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  children: React.ReactNode;
}

export function Selectable({
  selected = false,
  children,
  className,
  onClick,
  ...props
}: SelectableProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    // Remove focus after click to prevent focus ring from persisting
    divRef.current?.blur();
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: div with role="button" is intentional to wrap block-level children
    <div
      aria-pressed={selected}
      className={cn(
        "relative w-full cursor-pointer rounded-lg text-left transition-all duration-200 focus:outline-none",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        !selected && "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      ref={divRef}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

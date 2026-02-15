"use client";

// biome-ignore lint/performance/noNamespaceImport: m uses namespace proxy for m.div, m.button etc.
import * as m from "motion/react-m";
import { cn } from "@/lib/utils";

interface CellProps {
  isTarget: boolean;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function Cell({ isTarget, isSelected, onClick, disabled }: CellProps) {
  return (
    <m.button
      animate={isTarget && !isSelected ? { scale: [1, 1.05, 1] } : {}}
      aria-label={isTarget ? "Celda objetivo" : "Celda de la cuadrícula"}
      className={cn(
        "aspect-square h-full w-full rounded-md transition-colors",
        isTarget && "bg-green-500 hover:bg-green-600",
        !isTarget && isSelected && "bg-blue-500",
        !(isTarget || isSelected) &&
          "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      )}
      disabled={disabled}
      onClick={onClick}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.95 }}
    />
  );
}

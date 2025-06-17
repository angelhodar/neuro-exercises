"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CellProps {
  isTarget: boolean
  isSelected: boolean
  onClick: () => void
  disabled: boolean
}

export function Cell({ isTarget, isSelected, onClick, disabled }: CellProps) {
  return (
    <motion.button
      className={cn(
        "aspect-square w-full rounded-md transition-colors",
        isTarget
          ? "bg-green-500 hover:bg-green-600"
          : isSelected
            ? "bg-blue-500"
            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
      )}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      animate={isTarget && !isSelected ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
      aria-label={isTarget ? "Celda objetivo" : "Celda de la cuadrícula"}
    />
  )
}

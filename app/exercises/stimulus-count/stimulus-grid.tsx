"use client"

import React, { useMemo, useRef } from "react"
import { Star, Circle, Square, Triangle } from "lucide-react"
import type { Shape, Stimulus } from "./stimulus-count.schema"

interface StimulusGridProps {
  stimuli: Stimulus[]
  allowOverlap: boolean
}

function renderShape(shape: Shape, className: string) {
  const size = 64
  switch (shape) {
    case "star":
      return <Star className={className} size={size} fill="currentColor" stroke="currentColor" />
    case "circle":
      return <Circle className={className} size={size} fill="currentColor" stroke="currentColor" />
    case "square":
      return <Square className={className} size={size} fill="currentColor" stroke="currentColor" />
    case "triangle":
      return <Triangle className={className} size={size} fill="currentColor" stroke="currentColor" />
    default:
      return null
  }
}

export function StimulusGrid({ stimuli, allowOverlap }: StimulusGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const stimulusElements = useMemo(() => {
    const container = containerRef.current
    const placed: { x: number; y: number }[] = []
    const elements: React.ReactElement[] = []

    const containerWidth = container?.clientWidth ?? 400
    const containerHeight = container?.clientHeight ?? 256
    const stimulusSize = 64

    function isOverlapping(x: number, y: number): boolean {
      const padding = 8
      return placed.some((p) => Math.hypot(p.x - x, p.y - y) < stimulusSize - padding)
    }

    stimuli.forEach((stimulus, idx) => {
      let x = 0
      let y = 0
      let attempts = 0
      do {
        x = Math.random() * (containerWidth - stimulusSize)
        y = Math.random() * (containerHeight - stimulusSize)
        attempts++
        if (allowOverlap) break
      } while (!allowOverlap && isOverlapping(x, y) && attempts < 50)

      placed.push({ x, y })

      elements.push(
        <div
          key={idx}
          style={{ top: y, left: x, width: stimulusSize, height: stimulusSize }}
          className="absolute flex items-center justify-center"
        >
          {renderShape(stimulus.shape, `${stimulus.color}`)}
        </div>,
      )
    })

    return elements
  }, [stimuli, allowOverlap])

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-[28rem] border rounded-md bg-white dark:bg-gray-900`}
    >
      {stimulusElements}
    </div>
  )
} 
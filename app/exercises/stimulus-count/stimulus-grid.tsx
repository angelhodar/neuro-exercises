"use client";

import { Circle, Square, Star, Triangle } from "lucide-react";
import type React from "react";
import { useMemo, useRef } from "react";
import type { Shape, Stimulus } from "./stimulus-count.schema";

interface StimulusGridProps {
  stimuli: Stimulus[];
  allowOverlap: boolean;
}

function renderShape(shape: Shape, className: string) {
  const size = 64;
  switch (shape) {
    case "star":
      return (
        <Star
          className={className}
          fill="currentColor"
          size={size}
          stroke="currentColor"
        />
      );
    case "circle":
      return (
        <Circle
          className={className}
          fill="currentColor"
          size={size}
          stroke="currentColor"
        />
      );
    case "square":
      return (
        <Square
          className={className}
          fill="currentColor"
          size={size}
          stroke="currentColor"
        />
      );
    case "triangle":
      return (
        <Triangle
          className={className}
          fill="currentColor"
          size={size}
          stroke="currentColor"
        />
      );
    default:
      return null;
  }
}

export function StimulusGrid({ stimuli, allowOverlap }: StimulusGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const stimulusElements = useMemo(() => {
    const container = containerRef.current;
    const placed: { x: number; y: number }[] = [];
    const elements: React.ReactElement[] = [];

    const containerWidth = container?.clientWidth ?? 400;
    const containerHeight = container?.clientHeight ?? 256;
    const stimulusSize = 64;

    function isOverlapping(x: number, y: number): boolean {
      const padding = 8;
      return placed.some(
        (p) => Math.hypot(p.x - x, p.y - y) < stimulusSize - padding
      );
    }

    for (const [idx, stimulus] of stimuli.entries()) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      do {
        x = Math.random() * (containerWidth - stimulusSize);
        y = Math.random() * (containerHeight - stimulusSize);
        attempts++;
        if (allowOverlap) {
          break;
        }
      } while (!allowOverlap && isOverlapping(x, y) && attempts < 50);

      placed.push({ x, y });

      elements.push(
        <div
          className="absolute flex items-center justify-center"
          key={`${stimulus.shape}-${stimulus.color}-${idx}`}
          style={{ top: y, left: x, width: stimulusSize, height: stimulusSize }}
        >
          {renderShape(stimulus.shape, `${stimulus.color}`)}
        </div>
      );
    }

    return elements;
  }, [stimuli, allowOverlap]);

  return (
    <div
      className={
        "relative h-[28rem] flex-1 rounded-md border bg-white dark:bg-gray-900"
      }
      ref={containerRef}
    >
      {stimulusElements}
    </div>
  );
}

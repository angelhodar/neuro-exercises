"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import type {
  ColorSequenceConfig,
  ColorSequenceQuestionResult,
} from "./color-sequence.schema";

interface ColorSequenceExerciseProps {
  config: ColorSequenceConfig;
}

interface CellProps {
  colorClass: string;
  onClick: () => void;
  isHighlighted: boolean;
  disabled: boolean;
}

interface QuestionState {
  targetSequence: number[] | null;
  isPlaying: boolean;
  highlightedIndex: number | null;
  userSequence: number[];
  isWaitingNext: boolean;
}

function ColorCell({
  colorClass,
  onClick,
  isHighlighted,
  disabled,
}: CellProps) {
  return (
    <button
      className={`relative aspect-square w-full rounded-md transition-transform active:scale-95 ${colorClass} ${
        isHighlighted
          ? "outline outline-4 outline-black outline-offset-[-4px] ring-0"
          : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    />
  );
}

export function Exercise({ config }: ColorSequenceExerciseProps) {
  const { numCells, sequenceLength, highlightInterval } = config;

  const { currentQuestionIndex, addResult } = useExerciseExecution();

  // Ref to track timeouts for cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Colores disponibles (Tailwind)
  const availableColorClasses = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
  ];

  const colors = availableColorClasses.slice(0, numCells);

  // Estado interno agrupado
  const [questionState, setQuestionState] = useState<QuestionState>({
    targetSequence: null,
    isPlaying: false,
    highlightedIndex: null,
    userSequence: [],
    isWaitingNext: false,
  });

  // Maneja el clic del usuario
  function handleCellClick(index: number) {
    if (questionState.isPlaying || !questionState.targetSequence) {
      return;
    }

    const newSeq = [...questionState.userSequence, index];
    setQuestionState((prev) => ({ ...prev, userSequence: newSeq }));

    if (newSeq.length >= sequenceLength) {
      const isCorrect = newSeq.every(
        (val, i) => val === questionState.targetSequence?.[i]
      );
      const result: ColorSequenceQuestionResult = {
        targetSequence: questionState.targetSequence,
        userSequence: newSeq,
        isCorrect,
      };

      // Dar un pequeño tiempo antes de la siguiente pregunta
      setQuestionState((prev) => ({ ...prev, isWaitingNext: true }));
      setTimeout(() => {
        addResult(result);
        setQuestionState((prev) => ({ ...prev, isWaitingNext: false }));
      }, 300);
    }
  }

  // Resetea la respuesta actual del usuario
  function resetCurrentAnswer() {
    if (questionState.isPlaying || questionState.isWaitingNext) {
      return;
    }
    setQuestionState((prev) => ({ ...prev, userSequence: [] }));
  }

  // Efecto para iniciar pregunta al cambiar de pregunta
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    // Clear previous timeouts
    for (const t of timeoutsRef.current) {
      clearTimeout(t);
    }
    timeoutsRef.current = [];

    // Generate sequence
    const seq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      seq.push(Math.floor(Math.random() * numCells));
    }

    setQuestionState((prev) => ({
      ...prev,
      targetSequence: seq,
      userSequence: [],
      isPlaying: true,
    }));

    // Play the sequence
    const newTimeouts: NodeJS.Timeout[] = [];
    const highlightDuration = Math.max(200, highlightInterval / 2);

    for (const [i, cellIndex] of seq.entries()) {
      newTimeouts.push(
        setTimeout(() => {
          setQuestionState((prev) => ({
            ...prev,
            highlightedIndex: cellIndex,
          }));
        }, i * highlightInterval)
      );
      newTimeouts.push(
        setTimeout(
          () => {
            setQuestionState((prev) => ({ ...prev, highlightedIndex: null }));
          },
          i * highlightInterval + highlightDuration
        )
      );
    }

    newTimeouts.push(
      setTimeout(() => {
        setQuestionState((prev) => ({ ...prev, isPlaying: false }));
      }, seq.length * highlightInterval)
    );

    timeoutsRef.current = newTimeouts;

    return () => {
      for (const t of timeoutsRef.current) {
        clearTimeout(t);
      }
      timeoutsRef.current = [];
    };
  }, [currentQuestionIndex, numCells, sequenceLength, highlightInterval]);

  // Calcular disposicion de cuadricula
  const columns = Math.ceil(Math.sqrt(numCells));

  return (
    <div className="flex w-full flex-col items-center gap-6 p-6">
      {/* Cells grid */}
      <div
        className="grid w-full max-w-2xl gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {colors.map((colorClass, idx) => (
          <ColorCell
            colorClass={colorClass}
            disabled={questionState.isPlaying || questionState.isWaitingNext}
            isHighlighted={idx === questionState.highlightedIndex}
            key={colorClass}
            onClick={() => handleCellClick(idx)}
          />
        ))}
      </div>

      {/* Feedback de seleccion del usuario */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex gap-2">
          {Array.from({ length: sequenceLength }, (_, n) => n).map(
            (slotIndex) => {
              const selectedIdx = questionState.userSequence[slotIndex];
              const colorClass =
                selectedIdx !== undefined
                  ? colors[selectedIdx]
                  : "bg-gray-300 dark:bg-gray-700";
              return (
                <div
                  className={`h-8 w-8 rounded-sm ${colorClass}`}
                  key={`slot-${slotIndex}`}
                />
              );
            }
          )}
        </div>

        {/* Boton para resetear respuesta actual */}
        {questionState.userSequence.length > 0 && (
          <Button
            className="h-8 w-8 rounded-sm"
            disabled={questionState.isPlaying || questionState.isWaitingNext}
            onClick={resetCurrentAnswer}
            size="icon"
            type="button"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { ColorSequenceResults } from "./color-sequence-results";
import type {
  ColorSequenceConfig,
  ColorSequenceQuestionResult,
} from "./color-sequence-schema";


interface ColorSequenceExerciseProps {
  config: ColorSequenceConfig;
}

interface CellProps {
  colorClass: string;
  onClick: () => void;
  isHighlighted: boolean;
  disabled: boolean;
}

function ColorCell({ colorClass, onClick, isHighlighted, disabled }: CellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full aspect-square rounded-md transition-transform active:scale-95 ${colorClass} ${
        isHighlighted ? "ring-8 ring-yellow-300" : ""
      }`}
    />
  );
}

export function ColorSequenceExercise({ config }: ColorSequenceExerciseProps) {
  const { numCells, sequenceLength, highlightInterval } = config;

  const {
    exerciseState,
    currentQuestionIndex,
    addQuestionResult,
    results,
  } = useExerciseExecution();

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

  const colors = useMemo(() => availableColorClasses.slice(0, numCells), [numCells]);

  // Estado interno
  const [targetSequence, setTargetSequence] = useState<number[] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [timeouts, setTimeouts] = useState<NodeJS.Timeout[]>([]);
  const [isWaitingNext, setIsWaitingNext] = useState(false);

  // Genera una secuencia aleatoria
  function generateSequence(): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(Math.random() * numCells));
    }
    return sequence;
  }

  // Reproduce la secuencia
  function playSequence(seq: number[]) {
    // Limpiar cualquier timeout existente
    timeouts.forEach((t) => clearTimeout(t));

    const newTimeouts: NodeJS.Timeout[] = [];
    setIsPlaying(true);
    const highlightDuration = Math.max(200, highlightInterval / 2);

    seq.forEach((cellIndex, i) => {
      // Encender la celda
      newTimeouts.push(
        setTimeout(() => {
          setHighlightedIndex(cellIndex);
        }, i * highlightInterval),
      );
      // Apagar la celda
      newTimeouts.push(
        setTimeout(() => {
          setHighlightedIndex(null);
        }, i * highlightInterval + highlightDuration),
      );
    });

    // Finalizar reproducción
    newTimeouts.push(
      setTimeout(() => {
        setIsPlaying(false);
      }, seq.length * highlightInterval),
    );

    setTimeouts(newTimeouts);
  }

  // Prepara la pregunta actual
  function setupQuestion() {
    const seq = generateSequence();
    setTargetSequence(seq);
    setUserSequence([]);
    playSequence(seq);
  }

  // Maneja el clic del usuario
  function handleCellClick(index: number) {
    if (exerciseState !== "executing" || isPlaying || !targetSequence) return;

    const newSeq = [...userSequence, index];
    setUserSequence(newSeq);

    if (newSeq.length >= sequenceLength) {
      const isCorrect = newSeq.every((val, i) => val === targetSequence[i]);
      const result: ColorSequenceQuestionResult = {
        targetSequence,
        userSequence: newSeq,
        isCorrect,
      };

      // Dar un pequeño tiempo antes de la siguiente pregunta
      setIsWaitingNext(true);
      setTimeout(() => {
        addQuestionResult(result);
        setIsWaitingNext(false);
      }, 1000);
    }
  }

  // Efecto para iniciar pregunta al empezar ejercicio o al cambiar de pregunta
  useEffect(() => {
    if (exerciseState === "executing") {
      setupQuestion();
    }

    return () => {
      // Limpiar timeouts
      timeouts.forEach((t) => clearTimeout(t));
      setTimeouts([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseState, currentQuestionIndex]);

  // Calcular disposición de cuadrícula
  const columns = Math.ceil(Math.sqrt(numCells));

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {exerciseState !== "finished" && (
        <>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Secuencia de Colores</h2>
            {exerciseState === "executing" && (
              <p className="text-sm mt-2">Pregunta {currentQuestionIndex + 1}</p>
            )}
          </div>

          <div
            className="grid w-full max-w-2xl gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {colors.map((colorClass, idx) => (
              <ColorCell
                key={idx}
                colorClass={colorClass}
                isHighlighted={idx === highlightedIndex}
                onClick={() => handleCellClick(idx)}
                disabled={exerciseState !== "executing" || isPlaying || isWaitingNext}
              />
            ))}
          </div>

          {/* Feedback de selección del usuario */}
          {exerciseState === "executing" && (
            <div className="flex gap-2 mt-4">
              {Array.from({ length: sequenceLength }).map((_, i) => {
                const selectedIdx = userSequence[i];
                const colorClass = selectedIdx !== undefined ? colors[selectedIdx] : "bg-gray-300 dark:bg-gray-700";
                return <div key={i} className={`w-6 h-6 rounded-sm ${colorClass}`} />;
              })}
            </div>
          )}
        </>
      )}
      {exerciseState === "finished" && (
        <ColorSequenceResults results={results as ColorSequenceQuestionResult[]} />
      )}
    </div>
  );
} 
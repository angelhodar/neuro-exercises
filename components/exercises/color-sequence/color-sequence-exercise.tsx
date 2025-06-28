"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
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

interface QuestionState {
  targetSequence: number[] | null;
  isPlaying: boolean;
  highlightedIndex: number | null;
  userSequence: number[];
  timeouts: NodeJS.Timeout[];
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full aspect-square rounded-md transition-transform active:scale-95 ${colorClass} ${
        isHighlighted ? "ring-0 outline outline-4 outline-black outline-offset-[-4px]" : ""
      }`}
    />
  );
}

export function ColorSequenceExercise({ config }: ColorSequenceExerciseProps) {
  const { numCells, sequenceLength, highlightInterval } = config;

  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

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
    timeouts: [],
    isWaitingNext: false,
  });

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
    questionState.timeouts.forEach((t) => clearTimeout(t));

    const newTimeouts: NodeJS.Timeout[] = [];
    setQuestionState(prev => ({ ...prev, isPlaying: true }));
    const highlightDuration = Math.max(200, highlightInterval / 2);

    seq.forEach((cellIndex, i) => {
      // Encender la celda
      newTimeouts.push(
        setTimeout(() => {
          setQuestionState(prev => ({ ...prev, highlightedIndex: cellIndex }));
        }, i * highlightInterval)
      );
      // Apagar la celda
      newTimeouts.push(
        setTimeout(() => {
          setQuestionState(prev => ({ ...prev, highlightedIndex: null }));
        }, i * highlightInterval + highlightDuration)
      );
    });

    // Finalizar reproducción
    newTimeouts.push(
      setTimeout(() => {
        setQuestionState(prev => ({ ...prev, isPlaying: false }));
      }, seq.length * highlightInterval)
    );

    setQuestionState(prev => ({ ...prev, timeouts: newTimeouts }));
  }

  // Prepara la pregunta actual
  function setupQuestion() {
    const seq = generateSequence();
    setQuestionState(prev => ({
      ...prev,
      targetSequence: seq,
      userSequence: [],
    }));
    playSequence(seq);
  }

  // Maneja el clic del usuario
  function handleCellClick(index: number) {
    if (questionState.isPlaying || !questionState.targetSequence) return;

    const newSeq = [...questionState.userSequence, index];
    setQuestionState(prev => ({ ...prev, userSequence: newSeq }));

    if (newSeq.length >= sequenceLength) {
      const isCorrect = newSeq.every((val, i) => val === questionState.targetSequence![i]);
      const result: ColorSequenceQuestionResult = {
        targetSequence: questionState.targetSequence,
        userSequence: newSeq,
        isCorrect,
      };

      // Dar un pequeño tiempo antes de la siguiente pregunta
      setQuestionState(prev => ({ ...prev, isWaitingNext: true }));
      setTimeout(() => {
        addQuestionResult(result);
        setQuestionState(prev => ({ ...prev, isWaitingNext: false }));
      }, 300);
    }
  }

  // Resetea la respuesta actual del usuario
  function resetCurrentAnswer() {
    if (questionState.isPlaying || questionState.isWaitingNext) return;
    setQuestionState(prev => ({ ...prev, userSequence: [] }));
  }

  // Efecto para iniciar pregunta al cambiar de pregunta
  useEffect(() => {
    setupQuestion();

    return () => {
      // Limpiar timeouts
      questionState.timeouts.forEach((t) => clearTimeout(t));
      setQuestionState(prev => ({ ...prev, timeouts: [] }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  // Calcular disposición de cuadrícula
  const columns = Math.ceil(Math.sqrt(numCells));

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {/* Cells grid */}
      <div
        className="grid w-full max-w-2xl gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {colors.map((colorClass, idx) => (
          <ColorCell
            key={idx}
            colorClass={colorClass}
            isHighlighted={idx === questionState.highlightedIndex}
            onClick={() => handleCellClick(idx)}
            disabled={questionState.isPlaying || questionState.isWaitingNext}
          />
        ))}
      </div>

      {/* Feedback de selección del usuario */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex gap-2">
          {Array.from({ length: sequenceLength }).map((_, i) => {
            const selectedIdx = questionState.userSequence[i];
            const colorClass =
              selectedIdx !== undefined
                ? colors[selectedIdx]
                : "bg-gray-300 dark:bg-gray-700";
            return <div key={i} className={`w-8 h-8 rounded-sm ${colorClass}`} />;
          })}
        </div>
        
        {/* Botón para resetear respuesta actual */}
        {questionState.userSequence.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={resetCurrentAnswer}
            disabled={questionState.isPlaying || questionState.isWaitingNext}
            className="w-8 h-8 rounded-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

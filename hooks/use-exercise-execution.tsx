"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BaseExerciseConfig } from "@/lib/schemas/base-schemas";
import { Exercise } from "@/lib/db/schema";
import { saveExerciseResults } from "@/app/actions/links";

export type ExerciseState = "ready" | "executing" | "paused" | "finished";

interface ExerciseExecutionContext extends BaseExerciseConfig {
  exercise: Exercise;
  currentQuestionIndex: number;
  exerciseState: ExerciseState;
  waitingForNextQuestionTrigger: boolean;
  addResult: (result: object) => void;
  nextQuestion: () => void;
  finishExercise: () => Promise<void>;
  resetExercise: () => void;
  startExercise: () => void;
}

const ExerciseContext = createContext<ExerciseExecutionContext | null>(null);

type ExerciseProviderProps = BaseExerciseConfig &
  PropsWithChildren & { exercise: Exercise };

export function ExerciseProvider({
  children,
  exercise,
  ...config
}: ExerciseProviderProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exerciseState, setExerciseState] = useState<ExerciseState>("ready");
  const [waitingForNextQuestionTrigger, setWaitingForNextQuestionTrigger] =
    useState(false);
  const results = useRef<Array<object>>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  async function nextQuestion() {
    setWaitingForNextQuestionTrigger(false);
    if (currentQuestionIndex < config.totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      await finishExercise();
    }
  }

  function addResult(result: object) {
    results.current.push(result);
    if (config.automaticNextQuestion) nextQuestion();
    else setWaitingForNextQuestionTrigger(true);
  }

  async function finishExercise() {
    // Verificar si estamos ejecutando desde un link
    const linkId = searchParams.get("linkId");
    const itemId = searchParams.get("itemId");

    if (linkId && itemId && results.current.length > 0) {
      try {
        const numericLinkId = parseInt(linkId);
        const numericItemId = parseInt(itemId);

        console.log("Subiendo resultados automáticamente:", {
          linkId: numericLinkId,
          itemId: numericItemId,
          results,
        });

        await saveExerciseResults(numericLinkId, numericItemId, results);
        console.log("Resultados subidos exitosamente");

        // Solo cambiar estado si la API call fue exitosa
        setExerciseState("finished");

        // Redirigir a la página de resultados con parámetros de link
        router.push(
          `/exercises/${exercise.slug}/results?linkId=${linkId}&itemId=${itemId}`,
        );
      } catch (error) {
        toast.error("Error subiendo resultados");
        console.error("Error subiendo resultados:", error);
        // No cambiar el estado a "finished" si hay error
        return;
      }
    } else {
      // Ejercicio normal (sin link) - cambiar estado y redirigir
      setExerciseState("finished");

      // Redirigir a la página de resultados con los resultados en la URL
      const resultsParams = new URLSearchParams();

      resultsParams.set("results", JSON.stringify(results.current));
      resultsParams.set("config", JSON.stringify(config));

      router.push(
        `/exercises/${exercise.slug}/results?${resultsParams.toString()}`,
      );
    }
  }

  function startExercise() {
    setExerciseState("executing");
  }

  function resetExercise() {
    setCurrentQuestionIndex(0);
    setExerciseState("ready");
    results.current = [];
  }

  const contextValue: ExerciseExecutionContext = {
    exercise,
    currentQuestionIndex,
    exerciseState,
    waitingForNextQuestionTrigger,
    addResult,
    nextQuestion,
    finishExercise,
    resetExercise,
    startExercise,
    ...config,
  };

  return (
    <ExerciseContext.Provider value={contextValue}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExerciseExecution() {
  const context = useContext(ExerciseContext);

  if (!context) {
    throw new Error(
      "useExerciseExecution must be used within ExerciseProvider",
    );
  }

  return context;
}

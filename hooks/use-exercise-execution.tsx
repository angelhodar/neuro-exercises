"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { saveExerciseResults } from "@/app/actions/links";
import type { Exercise } from "@/lib/db/schema";
import type { BaseExerciseConfig } from "@/lib/schemas/base-schemas";

export type ExerciseState = "ready" | "executing" | "paused" | "finished";

export type ExerciseExecutionContext = BaseExerciseConfig & {
  exercise: Exercise;
  currentQuestionIndex: number;
  exerciseState: ExerciseState;
  waitingForNextQuestionTrigger: boolean;
  addResult: (result: object) => void;
  nextQuestion: () => void;
  finishExercise: () => Promise<void>;
  resetExercise: () => void;
  startExercise: () => void;
};

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
  const results = useRef<object[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();

  async function nextQuestion() {
    setWaitingForNextQuestionTrigger(false);
    if ("endConditionType" in config) {
      if (config.endConditionType === "questions") {
        if (currentQuestionIndex < (config.totalQuestions ?? 1) - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          await finishExercise();
        }
      } else if (config.endConditionType === "time") {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }
  }

  function addResult(result: object) {
    results.current.push(result);
    if (config.automaticNextQuestion) {
      nextQuestion();
    } else {
      setWaitingForNextQuestionTrigger(true);
    }
  }

  async function finishExercise() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const linkId = searchParams.get("linkId");
    const itemId = searchParams.get("itemId");

    if (linkId && itemId && results.current.length > 0) {
      try {
        const numericLinkId = Number.parseInt(linkId, 10);
        const numericItemId = Number.parseInt(itemId, 10);

        await saveExerciseResults(
          numericLinkId,
          numericItemId,
          results.current as unknown as Record<string, unknown>
        );

        setExerciseState("finished");

        router.push(
          `/exercises/${exercise.slug}/results?linkId=${linkId}&itemId=${itemId}`
        );
      } catch (error) {
        toast.error("Error subiendo resultados");
        console.error("Error subiendo resultados:", error);
        return;
      }
    } else {
      setExerciseState("finished");

      const resultsParams = new URLSearchParams();

      resultsParams.set("results", JSON.stringify(results.current));
      resultsParams.set("config", JSON.stringify(config));

      router.push(
        `/exercises/${exercise.slug}/results?${resultsParams.toString()}`
      );
    }
  }

  function startExercise() {
    setExerciseState("executing");
    if (
      "endConditionType" in config &&
      config.endConditionType === "time" &&
      config.timeLimitSeconds &&
      !timerRef.current
    ) {
      timerRef.current = setTimeout(() => {
        finishExercise();
      }, config.timeLimitSeconds * 1000);
    }
  }

  function resetExercise() {
    setCurrentQuestionIndex(0);
    setExerciseState("ready");
    results.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
      "useExerciseExecution must be used within ExerciseProvider"
    );
  }

  return context;
}

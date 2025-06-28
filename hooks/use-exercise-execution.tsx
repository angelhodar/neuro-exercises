"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";
import { BaseExerciseConfig } from "@/lib/schemas/base-schemas";
import { Exercise } from "@/lib/db/schema";

export type ExerciseState = "ready" | "executing" | "paused" | "finished";

interface ExerciseExecutionContext extends BaseExerciseConfig {
  exercise: Exercise;
  currentQuestionIndex: number;
  exerciseState: ExerciseState;
  results: Array<object>;
  waitingForNextQuestionTrigger: boolean;
  addQuestionResult: (result: object) => void;
  nextQuestion: () => void;
  pauseExercise: () => void;
  resumeExercise: () => void;
  finishExercise: () => void;
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
  const [results, setResults] = useState<Array<object>>([]);
  const [waitingForNextQuestionTrigger, setWaitingForNextQuestionTrigger] = useState(false);

  function nextQuestion() {
    setWaitingForNextQuestionTrigger(false)
    if (currentQuestionIndex < config.totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setExerciseState("finished");
    }
  }

  function addQuestionResult(result: object) {
    setResults((prev) => [...prev, result]);
    if (config.automaticNextQuestion) nextQuestion();
    else setWaitingForNextQuestionTrigger(true);
  }

  function pauseExercise() {
    setExerciseState("paused");
  }

  function resumeExercise() {
    setExerciseState("executing");
  }

  function finishExercise() {
    setExerciseState("finished");
  }

  function startExercise() {
    setExerciseState("executing");
  }

  function resetExercise() {
    setCurrentQuestionIndex(0);
    setExerciseState("ready");
    setResults([]);
  }

  const contextValue: ExerciseExecutionContext = {
    exercise,
    currentQuestionIndex,
    exerciseState,
    results,
    waitingForNextQuestionTrigger,
    addQuestionResult,
    nextQuestion,
    pauseExercise,
    resumeExercise,
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

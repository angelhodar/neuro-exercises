"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type ExerciseState = "ready" | "executing" | "paused" | "finished"

export interface ExerciseConfig {
  totalQuestions: number
}

interface ExerciseExecutionContext {
  currentQuestionIndex: number
  exerciseState: ExerciseState
  results: Array<object>
  addQuestionResult: (result: object) => void
  nextQuestion: () => void
  pauseExercise: () => void
  resumeExercise: () => void
  finishExercise: () => void
  resetExercise: () => void
  startExercise: () => void
}

const ExerciseContext = createContext<ExerciseExecutionContext | null>(null)

interface ExerciseProviderProps {
  children: ReactNode
  totalQuestions: number
}

export function ExerciseProvider({ children, totalQuestions }: ExerciseProviderProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [exerciseState, setExerciseState] = useState<ExerciseState>("ready")
  const [results, setResults] = useState<Array<object>>([])

  function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setExerciseState("finished")
    }
  }

  function addQuestionResult(result: object) {
    setResults((prev) => [...prev, result])
    nextQuestion()
  }

  function pauseExercise() {
    setExerciseState("paused")
  }

  function resumeExercise() {
    setExerciseState("executing")
  }

  function finishExercise() {
    setExerciseState("finished")
  }

  function startExercise() {
    setExerciseState("executing")
  }

  function resetExercise() {
    setCurrentQuestionIndex(0)
    setExerciseState("ready")
    setResults([])
  }

  const contextValue: ExerciseExecutionContext = {
    currentQuestionIndex,
    exerciseState,
    results,
    addQuestionResult,
    nextQuestion,
    pauseExercise,
    resumeExercise,
    finishExercise,
    resetExercise,
    startExercise,
  }

  return <ExerciseContext.Provider value={contextValue}>{children}</ExerciseContext.Provider>
}

export function useExerciseExecution(): ExerciseExecutionContext {
  const context = useContext(ExerciseContext)

  if (!context) {
    throw new Error("useExerciseExecution must be used within ExerciseProvider")
  }

  return context as ExerciseExecutionContext
}

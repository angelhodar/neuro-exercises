"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { useExerciseExecution } from "@/hooks/use-exercise-execution"
import { ExerciseControls } from "@/components/exercises/exercise-controls"
import { StimulusCountResults } from "./stimulus-count-results"
import type {
  StimulusCountConfig,
  StimulusCountQuestionResult,
  Shape,
  Stimulus,
} from "./stimulus-count-schema"
import { StimulusGrid } from "./stimulus-grid"
import { NumericPad } from "./numeric-pad"

interface StimulusCountExerciseProps {
  config: StimulusCountConfig
}

const shapes: Shape[] = ["star", "circle", "square", "triangle"]
const colors = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-lime-500",
  "text-green-500",
  "text-teal-500",
  "text-blue-500",
  "text-indigo-500",
  "text-pink-500",
]

export function StimulusCountExercise({ config }: StimulusCountExerciseProps) {
  const { minStimuli, maxStimuli, allowOverlap } = config

  const {
    exerciseState,
    currentQuestionIndex,
    addQuestionResult,
    startExercise,
    resetExercise,
    results,
  } = useExerciseExecution()

  const [stimuli, setStimuli] = useState<Stimulus[]>([])
  const [userAnswer, setUserAnswer] = useState("")
  const [questionStart, setQuestionStart] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  function setupQuestion() {
    const count = Math.floor(Math.random() * (maxStimuli - minStimuli + 1)) + minStimuli
    const newStimuli = Array.from({ length: count }).map(
      (): Stimulus => ({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      }),
    )
    setStimuli(newStimuli)
    setUserAnswer("")
    setQuestionStart(Date.now())
  }

  useEffect(() => {
    if (exerciseState === "executing") {
      setupQuestion()
    }
  }, [exerciseState, currentQuestionIndex])

  useEffect(() => {
    if (exerciseState === "executing") {
      inputRef.current?.focus()
    }
  }, [stimuli, exerciseState])

  function handleSubmit() {
    if (!questionStart) return

    const numericAnswer = parseInt(userAnswer, 10)
    if (isNaN(numericAnswer)) return

    const timeSpent = Date.now() - questionStart
    const isCorrect = numericAnswer === stimuli.length

    const result: StimulusCountQuestionResult = {
      shownStimuli: stimuli.length,
      userAnswer: numericAnswer,
      isCorrect,
      timeSpent,
    }

    addQuestionResult(result)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {exerciseState === "finished" ? (
        <StimulusCountResults results={results as StimulusCountQuestionResult[]} onReset={resetExercise} />
      ) : (
        <>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Conteo de estímulos</h2>
            {exerciseState === "executing" && (
              <p className="text-sm mt-2">Pregunta {currentQuestionIndex + 1}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl items-start justify-center">
            <StimulusGrid stimuli={stimuli} allowOverlap={allowOverlap} />

            {exerciseState === "executing" && (
              <NumericPad
                value={userAnswer}
                onChange={setUserAnswer}
                onSubmit={handleSubmit}
                inputRef={inputRef}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
} 
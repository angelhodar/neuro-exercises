"use client"

import { useEffect, useState } from "react"
import { useExerciseExecution } from "@/contexts/exercise-context"
import { Cell } from "./cell"
import { ExerciseControls } from "./exercise-controls"
import { ExerciseResults } from "./exercise-results"
import type { ReactionTimeGridConfig, ReactionTimeQuestionResult } from "./reaction-time-grid-schema"

interface ReactionTimeGridProps {
  config: ReactionTimeGridConfig
}

interface QuestionState {
  targetCells: number[] | null
  startTime: number | null
  timeoutId: NodeJS.Timeout | null
  selectedCells: number[]
  reactionTimes: number[]
}

export function ReactionTimeGrid({ config }: ReactionTimeGridProps) {
  const { gridSize, delayMin, delayMax, cells } = config
  
  const { exerciseState, currentQuestionIndex, addQuestionResult, startExercise, resetExercise, results } =
    useExerciseExecution()

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetCells: null,
    startTime: null,
    timeoutId: null,
    selectedCells: [],
    reactionTimes: [],
  })

  // Generate grid cells as simple indices
  const totalCellsCount = gridSize * gridSize
  const gridCells = Array.from({ length: totalCellsCount }, (_, index) => index)

  // Select random cells to be the targets
  function selectRandomCells() {
    const shuffled = [...gridCells].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, cells)
  }

  // Handle cell click
  function handleCellClick(cellIndex: number) {
    if (exerciseState !== "executing" || !questionState.targetCells) return

    const endTime = Date.now()
    const reactionTime = questionState.startTime ? endTime - questionState.startTime : 0

    // Add to selected cells and reaction times
    const updatedSelectedCells = [...questionState.selectedCells, cellIndex]
    const updatedReactionTimes = [...questionState.reactionTimes, reactionTime]

    setQuestionState((prev) => ({
      ...prev,
      selectedCells: updatedSelectedCells,
      reactionTimes: updatedReactionTimes,
    }))

    // If we've selected enough cells or all target cells, submit the result
    if (updatedSelectedCells.length >= questionState.targetCells.length) {
      const result: ReactionTimeQuestionResult = {
        targetCells: questionState.targetCells,
        selectedCells: updatedSelectedCells,
        reactionTimes: updatedReactionTimes,
      }

      addQuestionResult(result)

      // Reset for next question
      setQuestionState((prev) => ({
        ...prev,
        targetCells: null,
        selectedCells: [],
        reactionTimes: [],
      }))
    }
  }

  // Set up the next target after a random delay
  function setupNextTarget() {
    if (exerciseState !== "executing") return

    // Clear any existing timeout
    if (questionState.timeoutId) {
      clearTimeout(questionState.timeoutId)
    }

    setQuestionState((prev) => ({
      ...prev,
      targetCells: null,
      selectedCells: [],
      reactionTimes: [],
    }))

    // Random delay before showing the target
    const delay = Math.floor(Math.random() * (delayMax - delayMin) + delayMin)

    const timeout = setTimeout(() => {
      const newTargets = selectRandomCells()
      setQuestionState((prev) => ({
        ...prev,
        targetCells: newTargets,
        startTime: Date.now(),
        timeoutId: null,
      }))
    }, delay)

    setQuestionState((prev) => ({ ...prev, timeoutId: timeout }))
  }

  // Set up the next target when the question changes or exercise starts
  useEffect(() => {
    if (exerciseState === "executing") {
      setupNextTarget()
    }

    return () => {
      if (questionState.timeoutId) {
        clearTimeout(questionState.timeoutId)
      }
    }
  }, [currentQuestionIndex, exerciseState])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (questionState.timeoutId) {
        clearTimeout(questionState.timeoutId)
      }
    }
  }, [])

  // Check if a cell is a target
  function isTargetCell(cellIndex: number) {
    if (!questionState.targetCells) return false
    return questionState.targetCells.includes(cellIndex)
  }

  // Check if a cell has been selected
  function isSelectedCell(cellIndex: number) {
    return questionState.selectedCells.includes(cellIndex)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {exerciseState === "finished" ? (
        <ExerciseResults
          results={results as ReactionTimeQuestionResult[]}
          onReset={resetExercise}
          gridSize={gridSize}
        />
      ) : (
        <>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Prueba de Tiempo de Reacción</h2>
            <p className="text-gray-600">Haz clic en la celda resaltada lo más rápido posible</p>
            {exerciseState === "executing" && <p className="text-sm mt-2">Pregunta {currentQuestionIndex + 1}</p>}
          </div>

          <div
            className="grid aspect-square w-full max-w-4xl"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              gap: "4px",
            }}
          >
            {gridCells.map((cellIndex) => (
              <Cell
                key={cellIndex}
                isTarget={isTargetCell(cellIndex)}
                isSelected={isSelectedCell(cellIndex)}
                onClick={() => handleCellClick(cellIndex)}
                disabled={exerciseState !== "executing" || !questionState.targetCells || isSelectedCell(cellIndex)}
              />
            ))}
          </div>

          <ExerciseControls exerciseState={exerciseState} onStart={startExercise} onReset={resetExercise} />
        </>
      )}
    </div>
  )
}

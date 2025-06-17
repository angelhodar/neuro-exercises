"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface QuestionResult {
  targetCells: number[]
  selectedCells: number[]
  reactionTimes: number[]
}

interface ExerciseResultsProps {
  results: QuestionResult[]
  onReset: () => void
  gridSize: number
}

export function ExerciseResults({ results, onReset, gridSize }: ExerciseResultsProps) {
  // Helper function to check if a result is correct
  function calculateCorrectSelections(result: QuestionResult): number {
    return result.selectedCells.filter((cell) => result.targetCells.includes(cell)).length
  }

  // Helper function to convert index to [row, col] format for display
  function indexToCoordinates(index: number): string {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    return `[${row}, ${col}]`
  }

  // Calculate statistics
  const correctSelections = results.reduce((total, result) => total + calculateCorrectSelections(result), 0)
  const totalTargets = results.reduce((total, result) => total + result.targetCells.length, 0)
  const accuracy = totalTargets > 0 ? (correctSelections / totalTargets) * 100 : 0

  // Calculate average reaction time for correct selections
  let totalCorrectReactionTime = 0
  let totalCorrectSelections = 0

  results.forEach((result) => {
    result.selectedCells.forEach((cell, index) => {
      if (result.targetCells.includes(cell)) {
        totalCorrectReactionTime += result.reactionTimes[index]
        totalCorrectSelections++
      }
    })
  })

  const avgReactionTime = totalCorrectSelections > 0 ? totalCorrectReactionTime / totalCorrectSelections : 0

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Resultados del Ejercicio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Precisión</p>
          <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo de Reacción Promedio</p>
          <p className="text-2xl font-bold">{avgReactionTime.toFixed(0)} ms</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación</p>
          <p className="text-2xl font-bold">
            {correctSelections}/{totalTargets}
          </p>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Celdas Objetivo</TableHead>
              <TableHead>Celdas Seleccionadas</TableHead>
              <TableHead>Tiempos de Reacción</TableHead>
              <TableHead>Correcto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => {
              const correctCount = calculateCorrectSelections(result)
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {result.targetCells.map((cell, i) => (
                      <span key={i} className="block">
                        {indexToCoordinates(cell)}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {result.selectedCells.map((cell, i) => (
                      <span
                        key={i}
                        className={`block ${result.targetCells.includes(cell) ? "text-green-600" : "text-red-600"}`}
                      >
                        {indexToCoordinates(cell)}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {result.reactionTimes.map((time, i) => (
                      <span key={i} className="block">
                        {time} ms
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        correctCount === result.targetCells.length
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : correctCount > 0
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {correctCount}/{result.targetCells.length}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Button onClick={onReset}>Intentar de Nuevo</Button>
    </div>
  )
}

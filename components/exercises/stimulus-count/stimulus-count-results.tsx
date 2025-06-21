"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StimulusCountQuestionResult } from "./stimulus-count-schema"

interface StimulusCountResultsProps {
  results: StimulusCountQuestionResult[]
  onReset?: () => void
}

export function StimulusCountResults({ results, onReset }: StimulusCountResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length
  const accuracy = results.length > 0 ? (totalCorrect / results.length) * 100 : 0

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Resultados del Ejercicio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Precisión</p>
          <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Respuestas Correctas</p>
          <p className="text-2xl font-bold">
            {totalCorrect}/{results.length}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Preguntas</p>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Estímulos Mostrados</TableHead>
              <TableHead>Respuesta del Usuario</TableHead>
              <TableHead>Correcto</TableHead>
              <TableHead>Tiempo (ms)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{result.shownStimuli}</TableCell>
                <TableCell>{result.userAnswer}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      result.isCorrect
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {result.isCorrect ? "Sí" : "No"}
                  </span>
                </TableCell>
                <TableCell>{result.timeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {onReset && <Button onClick={onReset}>Intentar de Nuevo</Button>}
    </div>
  )
} 
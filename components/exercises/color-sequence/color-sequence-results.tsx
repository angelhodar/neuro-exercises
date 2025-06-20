"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ColorSequenceQuestionResult } from "./color-sequence-schema";

interface ColorSequenceResultsProps {
  results: ColorSequenceQuestionResult[];
  onReset?: () => void;
}

export function ColorSequenceResults({ results, onReset }: ColorSequenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = (totalCorrect / results.length) * 100;

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Resultados del Ejercicio</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Precisión</p>
          <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación</p>
          <p className="text-2xl font-bold">
            {totalCorrect}/{results.length}
          </p>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Secuencia Objetivo</TableHead>
              <TableHead>Secuencia Usuario</TableHead>
              <TableHead>Correcto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {result.targetSequence.map((c, i) => (
                    <span key={i} className="inline-block mr-1">
                      {c}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  {result.userSequence.map((c, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-1 ${
                        c === result.targetSequence[i] ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  {result.isCorrect ? (
                    <span className="text-green-600 font-semibold">Sí</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {onReset && <Button onClick={onReset}>Intentar de Nuevo</Button>}
    </div>
  );
} 
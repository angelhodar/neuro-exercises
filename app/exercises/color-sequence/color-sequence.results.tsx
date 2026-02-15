import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColorSequenceQuestionResult } from "./color-sequence.schema";

interface ColorSequenceResultsProps {
  results: ColorSequenceQuestionResult[];
}

export function Results({ results }: ColorSequenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = (totalCorrect / results.length) * 100;

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-4 font-bold text-2xl">Resultados del Ejercicio</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Precisión</p>
          <p className="font-bold text-2xl">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Puntuación</p>
          <p className="font-bold text-2xl">
            {totalCorrect}/{results.length}
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-md border">
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
              <TableRow key={`row-${result.targetSequence.join("-")}-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {result.targetSequence.map((c: number, i: number) => (
                    <span
                      className="mr-1 inline-block"
                      key={`target-${i}-${c}`}
                    >
                      {c}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  {result.userSequence.map((c: number, i: number) => (
                    <span
                      className={`mr-1 inline-block ${
                        c === result.targetSequence[i]
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      key={`user-${i}-${c}`}
                    >
                      {c}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  {result.isCorrect ? (
                    <span className="font-semibold text-green-600">Sí</span>
                  ) : (
                    <span className="font-semibold text-red-600">No</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

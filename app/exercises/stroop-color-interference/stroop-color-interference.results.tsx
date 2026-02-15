import { CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StroopColorInterferenceQuestionResult } from "./stroop-color-interference.schema";

interface StroopColorInterferenceResultsProps {
  results: StroopColorInterferenceQuestionResult[];
}

export function Results({ results }: StroopColorInterferenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = (totalCorrect / results.length) * 100;
  const averageResponseTime =
    results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="mb-4 text-center font-bold text-2xl">
        Resultados del Ejercicio
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Tiempo Medio
          </p>
          <p className="font-bold text-2xl">
            {(averageResponseTime / 1000).toFixed(2)}s
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Palabra</TableHead>
              <TableHead>Color Tinta</TableHead>
              <TableHead>Tu Respuesta</TableHead>
              <TableHead className="text-right">Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={`${result.word}-${result.color}-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{result.word}</TableCell>
                <TableCell>{result.color}</TableCell>
                <TableCell
                  className={
                    result.isCorrect ? "text-green-600" : "text-red-600"
                  }
                >
                  {result.userAnswer}
                </TableCell>
                <TableCell className="text-right">
                  {result.isCorrect ? (
                    <CheckCircle className="inline-block h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="inline-block h-5 w-5 text-red-600" />
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

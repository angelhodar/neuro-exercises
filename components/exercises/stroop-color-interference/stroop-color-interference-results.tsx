import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import type { StroopColorInterferenceQuestionResult } from "./stroop-color-interference-schema";

interface StroopColorInterferenceResultsProps {
  results: StroopColorInterferenceQuestionResult[];
}

export function StroopColorInterferenceResults({
  results,
}: StroopColorInterferenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = (totalCorrect / results.length) * 100;
  const averageResponseTime =
    results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Resultados del Ejercicio
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tiempo Medio
          </p>
          <p className="text-2xl font-bold">
            {(averageResponseTime / 1000).toFixed(2)}s
          </p>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
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
              <TableRow key={index}>
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
                    <CheckCircle className="w-5 h-5 text-green-600 inline-block" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 inline-block" />
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

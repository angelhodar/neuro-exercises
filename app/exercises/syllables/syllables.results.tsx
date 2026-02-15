import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SyllablesQuestionResult } from "./syllables.schema";

interface SyllablesResultsProps {
  results: SyllablesQuestionResult[];
}

export function Results({ results }: SyllablesResultsProps) {
  // Helper function to check if a result is correct (inferred from syllables match)
  function isCorrect(result: SyllablesQuestionResult): boolean {
    return (
      result.selectedSyllables.join("") === result.targetSyllables.join("")
    );
  }

  // Calculate statistics
  const totalQuestions = results.length;
  const correctAnswers = results.filter(isCorrect).length;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Calculate average time spent for correct answers
  const correctResults = results.filter(
    (result) => isCorrect(result) && !result.timeExpired
  );
  const avgTimeSpent =
    correctResults.length > 0
      ? correctResults.reduce((sum, result) => sum + result.timeSpent, 0) /
        correctResults.length
      : 0;

  return (
    <div className="w-full max-w-4xl">
      <h2 className="mb-4 font-bold text-2xl">Resultados del Ejercicio</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Precisión</p>
          <p className="font-bold text-2xl">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Tiempo Promedio
          </p>
          <p className="font-bold text-2xl">
            {(avgTimeSpent / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Puntuación</p>
          <p className="font-bold text-2xl">
            {correctAnswers}/{totalQuestions}
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Palabra Objetivo</TableHead>
              <TableHead>Tu Respuesta</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => {
              const resultIsCorrect = isCorrect(result);
              return (
                <TableRow key={`${result.targetWord}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.targetWord}</div>
                      <div className="text-muted-foreground text-sm">
                        {result.targetSyllables.join(" - ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {result.selectedSyllables.length > 0
                        ? result.selectedSyllables.join(" - ")
                        : "Sin respuesta"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.timeExpired ? (
                      <span className="text-red-600">Tiempo agotado</span>
                    ) : (
                      `${(result.timeSpent / 1000).toFixed(1)}s`
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        resultIsCorrect
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {resultIsCorrect ? "Correcto" : "Incorrecto"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

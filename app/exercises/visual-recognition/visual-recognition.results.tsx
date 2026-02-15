import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VisualRecognitionQuestionResult } from "./visual-recognition.schema";

interface VisualRecognitionResultsProps {
  results: VisualRecognitionQuestionResult[];
}

export function Results({ results }: VisualRecognitionResultsProps) {
  // Helper function to calculate accuracy for a result
  function calculateAccuracy(result: VisualRecognitionQuestionResult): number {
    const correctSelections = result.selectedImages.filter((id) =>
      result.correctImages.includes(id)
    ).length;
    const incorrectSelections = result.selectedImages.filter(
      (id) => !result.correctImages.includes(id)
    ).length;

    const totalPossiblePoints = result.correctImages.length;
    const earnedPoints = Math.max(0, correctSelections - incorrectSelections);

    return totalPossiblePoints > 0
      ? (earnedPoints / totalPossiblePoints) * 100
      : 0;
  }

  // Helper function to check if a result is perfect
  function isPerfectMatch(result: VisualRecognitionQuestionResult): boolean {
    return (
      result.selectedImages.length === result.correctImages.length &&
      result.selectedImages.every((id) => result.correctImages.includes(id))
    );
  }

  // Calculate statistics
  const totalQuestions = results.length;
  const perfectMatches = results.filter(isPerfectMatch).length;
  const overallAccuracy =
    results.length > 0
      ? results.reduce((sum, result) => sum + calculateAccuracy(result), 0) /
        results.length
      : 0;

  // Calculate average time spent for completed answers
  const completedResults = results.filter((result) => !result.timeExpired);
  const avgTimeSpent =
    completedResults.length > 0
      ? completedResults.reduce((sum, result) => sum + result.timeSpent, 0) /
        completedResults.length
      : 0;

  return (
    <div className="w-full max-w-5xl">
      <h2 className="mb-4 font-bold text-2xl">Resultados del Ejercicio</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Precisión Promedio
          </p>
          <p className="font-bold text-2xl">{overallAccuracy.toFixed(1)}%</p>
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
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Respuestas Perfectas
          </p>
          <p className="font-bold text-2xl">
            {perfectMatches}/{totalQuestions}
          </p>
        </div>
      </div>

      <div className="mb-6 h-96 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Etiqueta Objetivo</TableHead>
              <TableHead>Correctas</TableHead>
              <TableHead>Seleccionadas</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Precisión</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => {
              const accuracy = calculateAccuracy(result);
              const perfect = isPerfectMatch(result);
              const correctSelections = result.selectedImages.filter((id) =>
                result.correctImages.includes(id)
              ).length;
              const incorrectSelections =
                result.selectedImages.length - correctSelections;

              return (
                <TableRow key={`${result.targetTag}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Badge className="capitalize" variant="outline">
                      {result.targetTag}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {result.correctImages.length} imágenes
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {result.selectedImages.length} total
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {correctSelections} correctas, {incorrectSelections}{" "}
                        incorrectas
                      </div>
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
                    <div className="flex items-center gap-2">
                      {(() => {
                        let badgeClass: string;
                        if (perfect) {
                          badgeClass =
                            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                        } else if (accuracy >= 50) {
                          badgeClass =
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                        } else {
                          badgeClass =
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                        }
                        return (
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${badgeClass}`}
                          >
                            {accuracy.toFixed(0)}%
                          </span>
                        );
                      })()}
                      {perfect && <span className="text-green-600">✓</span>}
                    </div>
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

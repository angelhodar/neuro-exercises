import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { StroopTestQuestionResult } from "./prueba-pr-schema";

interface PruebaPrResultsProps {
  results: StroopTestQuestionResult[];
}

export function PruebaPrResults({ results }: PruebaPrResultsProps) {
  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const correctCongruentResults = results.filter(
    (r) => r.isCorrect && r.isCongruent,
  );
  const correctIncongruentResults = results.filter(
    (r) => r.isCorrect && !r.isCongruent,
  );

  const averageReactionTime =
    correctAnswers > 0
      ? results
          .filter((r) => r.isCorrect)
          .reduce((sum, r) => sum + r.timeSpent, 0) / correctAnswers
      : 0;

  const averageCongruentTime =
    correctCongruentResults.length > 0
      ? correctCongruentResults.reduce((sum, r) => sum + r.timeSpent, 0) /
        correctCongruentResults.length
      : 0;

  const averageIncongruentTime =
    correctIncongruentResults.length > 0
      ? correctIncongruentResults.reduce((sum, r) => sum + r.timeSpent, 0) /
        correctIncongruentResults.length
      : 0;

  const stroopEffect = averageIncongruentTime - averageCongruentTime;

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Resultados del Test de Stroop</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Precisión General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {correctAnswers} de {totalQuestions} correctas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Reacción Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageReactionTime.toFixed(0)} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Solo respuestas correctas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Congruente Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageCongruentTime.toFixed(0)} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Respuestas correctas congruentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Incongruente Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageIncongruentTime.toFixed(0)} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Respuestas correctas incongruentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Efecto Stroop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stroopEffect.toFixed(0)} ms
          </div>
          <p className="text-sm text-muted-foreground">
            (Tiempo Incongruente Promedio - Tiempo Congruente Promedio)
          </p>
          {stroopEffect > 0 && (
            <p className="text-sm text-red-500 mt-2">
              Un valor positivo indica interferencia cognitiva.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="border rounded-md overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Palabra Mostrada</TableHead>
              <TableHead>Color Tinta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Respuesta Usuario</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Tiempo (ms)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{result.wordText}</TableCell>
                <TableCell>{result.wordColor}</TableCell>
                <TableCell>
                  {result.isCongruent ? "Congruente" : "Incongruente"}
                </TableCell>
                <TableCell>
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </TableCell>
                <TableCell>{result.timeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

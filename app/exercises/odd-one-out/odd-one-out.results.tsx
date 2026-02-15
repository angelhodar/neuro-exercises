import { CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OddOneOutResult } from "./odd-one-out.schema";

interface OddOneOutResultsProps {
  results: OddOneOutResult[];
}

export function Results({ results }: OddOneOutResultsProps) {
  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Resultados: Odd-One-Out</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
          <div>
            <p className="text-muted-foreground text-sm">Precisión</p>
            <p className="font-bold text-2xl">{accuracy.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              Respuestas Correctas
            </p>
            <p className="font-bold text-2xl">
              {correctAnswers} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Resumen por pregunta:</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result) => (
              <li
                className="flex items-center justify-between py-3"
                key={result.questionIndex}
              >
                <p>Pregunta {result.questionIndex + 1}</p>
                {result.isCorrect ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Correcto</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span>Incorrecto</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

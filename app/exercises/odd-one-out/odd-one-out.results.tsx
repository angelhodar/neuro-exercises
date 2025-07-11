import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { OddOneOutResult } from "./odd-one-out.schema";

interface OddOneOutResultsProps {
  results: OddOneOutResult[];
}

export function Results({ results }: OddOneOutResultsProps) {
  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Resultados: Odd-One-Out</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Precisión</p>
            <p className="text-2xl font-bold">{accuracy.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Respuestas Correctas</p>
            <p className="text-2xl font-bold">
              {correctAnswers} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Resumen por pregunta:</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result) => (
              <li key={result.questionIndex} className="py-3 flex items-center justify-between">
                <p>Pregunta {result.questionIndex + 1}</p>
                {result.isCorrect ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Correcto</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
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
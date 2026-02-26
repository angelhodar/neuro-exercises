"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { AccuracyDonutChart } from "@/components/exercises/charts/result-chart-card";
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
  const incorrectAnswers = totalQuestions - correctAnswers;
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
        <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr]">
          <AccuracyDonutChart
            accuracy={accuracy}
            correct={correctAnswers}
            incorrect={incorrectAnswers}
          />

          <div className="grid gap-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Precisión</p>
              <p className="font-semibold text-2xl tracking-tight">
                {accuracy.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">
                Respuestas Correctas
              </p>
              <p className="font-semibold text-2xl tracking-tight">
                {correctAnswers} / {totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Resumen por pregunta:</h3>
          <ul className="divide-y">
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

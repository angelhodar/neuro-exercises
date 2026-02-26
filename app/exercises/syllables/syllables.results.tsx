"use client";

import {
  ResultBarChart,
  StatRow,
} from "@/components/exercises/charts/result-chart-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell as TCell,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SyllablesQuestionResult } from "./syllables.schema";

const syllablesChartConfig = {
  tiempo: { label: "Tiempo (s)" },
  correcto: { label: "Correcto", color: "var(--chart-2)" },
  incorrecto: { label: "Incorrecto", color: "var(--chart-1)" },
  expirado: { label: "Tiempo agotado", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface SyllablesResultsProps {
  results: SyllablesQuestionResult[];
}

export function Results({ results }: SyllablesResultsProps) {
  function isCorrect(result: SyllablesQuestionResult): boolean {
    return (
      result.selectedSyllables.join("") === result.targetSyllables.join("")
    );
  }

  const totalQuestions = results.length;
  const correctAnswers = results.filter(isCorrect).length;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const correctResults = results.filter(
    (result) => isCorrect(result) && !result.timeExpired
  );
  const avgTimeSpent =
    correctResults.length > 0
      ? correctResults.reduce((sum, result) => sum + result.timeSpent, 0) /
        correctResults.length
      : 0;

  const chartData = results.map((r, i) => {
    let fill = "var(--color-incorrecto)";
    if (r.timeExpired) {
      fill = "var(--color-expirado)";
    } else if (isCorrect(r)) {
      fill = "var(--color-correcto)";
    }
    return {
      question: `${i + 1}`,
      tiempo: r.timeSpent,
      fill,
    };
  });

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Resultados: Sílabas</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatRow
          items={[
            { label: "Precisión", value: `${accuracy.toFixed(1)}%` },
            {
              label: "Tiempo Promedio",
              value: `${(avgTimeSpent / 1000).toFixed(1)}s`,
            },
            {
              label: "Puntuación",
              value: `${correctAnswers}/${totalQuestions}`,
            },
          ]}
        />

        <Tabs defaultValue="grafico">
          <TabsList>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico">
            <ResultBarChart config={syllablesChartConfig} data={chartData} />
          </TabsContent>
          <TabsContent value="tabla">
            <div className="overflow-hidden rounded-md border">
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
                        <TCell>{index + 1}</TCell>
                        <TCell>
                          <div>
                            <div className="font-medium">
                              {result.targetWord}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {result.targetSyllables.join(" - ")}
                            </div>
                          </div>
                        </TCell>
                        <TCell>
                          <div className="text-sm">
                            {result.selectedSyllables.length > 0
                              ? result.selectedSyllables.join(" - ")
                              : "Sin respuesta"}
                          </div>
                        </TCell>
                        <TCell>
                          {result.timeExpired ? (
                            <span className="text-red-600">Tiempo agotado</span>
                          ) : (
                            `${(result.timeSpent / 1000).toFixed(1)}s`
                          )}
                        </TCell>
                        <TCell>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${
                              resultIsCorrect
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {resultIsCorrect ? "Correcto" : "Incorrecto"}
                          </span>
                        </TCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

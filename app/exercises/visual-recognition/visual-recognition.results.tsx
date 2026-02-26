"use client";

import {
  ResultBarChart,
  StatRow,
} from "@/components/exercises/charts/result-chart-card";
import { Badge } from "@/components/ui/badge";
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
import type { VisualRecognitionQuestionResult } from "./visual-recognition.schema";

const visualRecognitionChartConfig = {
  tiempo: { label: "Tiempo (s)" },
  perfecto: { label: "Perfecto", color: "var(--chart-2)" },
  parcial: { label: "Parcial", color: "var(--chart-3)" },
  bajo: { label: "Bajo", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface VisualRecognitionResultsProps {
  results: VisualRecognitionQuestionResult[];
}

export function Results({ results }: VisualRecognitionResultsProps) {
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

  function isPerfectMatch(result: VisualRecognitionQuestionResult): boolean {
    return (
      result.selectedImages.length === result.correctImages.length &&
      result.selectedImages.every((id) => result.correctImages.includes(id))
    );
  }

  const totalQuestions = results.length;
  const perfectMatches = results.filter(isPerfectMatch).length;
  const overallAccuracy =
    results.length > 0
      ? results.reduce((sum, result) => sum + calculateAccuracy(result), 0) /
        results.length
      : 0;

  const completedResults = results.filter((result) => !result.timeExpired);
  const avgTimeSpent =
    completedResults.length > 0
      ? completedResults.reduce((sum, result) => sum + result.timeSpent, 0) /
        completedResults.length
      : 0;

  const chartData = results.map((r, i) => {
    const acc = calculateAccuracy(r);
    let fill = "var(--color-bajo)";
    if (isPerfectMatch(r)) {
      fill = "var(--color-perfecto)";
    } else if (acc >= 50) {
      fill = "var(--color-parcial)";
    }
    return {
      question: `${i + 1}`,
      tiempo: r.timeSpent,
      fill,
    };
  });

  return (
    <Card className="mx-auto w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Resultados: Reconocimiento Visual</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatRow
          items={[
            {
              label: "Precisión Promedio",
              value: `${overallAccuracy.toFixed(1)}%`,
            },
            {
              label: "Tiempo Promedio",
              value: `${(avgTimeSpent / 1000).toFixed(1)}s`,
            },
            {
              label: "Respuestas Perfectas",
              value: `${perfectMatches}/${totalQuestions}`,
            },
          ]}
        />

        <Tabs defaultValue="grafico">
          <TabsList>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico">
            <ResultBarChart
              config={visualRecognitionChartConfig}
              data={chartData}
            />
          </TabsContent>
          <TabsContent value="tabla">
            <div className="h-96 overflow-y-auto rounded-md border">
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
                    const correctSelections = result.selectedImages.filter(
                      (id) => result.correctImages.includes(id)
                    ).length;
                    const incorrectSelections =
                      result.selectedImages.length - correctSelections;

                    return (
                      <TableRow key={`${result.targetTag}-${index}`}>
                        <TCell>{index + 1}</TCell>
                        <TCell>
                          <Badge className="capitalize" variant="outline">
                            {result.targetTag}
                          </Badge>
                        </TCell>
                        <TCell>
                          <div className="text-sm">
                            {result.correctImages.length} imágenes
                          </div>
                        </TCell>
                        <TCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {result.selectedImages.length} total
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {correctSelections} correctas,{" "}
                              {incorrectSelections} incorrectas
                            </div>
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
                            {perfect && (
                              <span className="text-green-600">✓</span>
                            )}
                          </div>
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

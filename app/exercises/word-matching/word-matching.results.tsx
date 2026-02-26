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
import type { WordMatchingQuestionResult } from "./word-matching.schema";

const wordMatchingChartConfig = {
  tiempo: { label: "Tiempo (s)" },
  correcto: { label: "Sin errores", color: "var(--chart-2)" },
  incorrecto: { label: "Con errores", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface WordMatchingResultsProps {
  results: WordMatchingQuestionResult[];
}

export function Results({ results }: WordMatchingResultsProps) {
  const totalRounds = results.length;
  const perfectRounds = results.filter((r) => r.incorrectAttempts === 0).length;
  const accuracy = totalRounds > 0 ? (perfectRounds / totalRounds) * 100 : 0;
  const totalCorrectMatches = results.reduce(
    (sum, r) => sum + r.correctMatches,
    0
  );
  const totalIncorrectAttempts = results.reduce(
    (sum, r) => sum + r.incorrectAttempts,
    0
  );
  const avgTimeSpent =
    totalRounds > 0
      ? results.reduce((sum, r) => sum + r.timeSpent, 0) / totalRounds
      : 0;

  const chartData = results.map((r, i) => ({
    question: `${i + 1}`,
    tiempo: r.timeSpent,
    fill:
      r.incorrectAttempts === 0
        ? "var(--color-correcto)"
        : "var(--color-incorrecto)",
  }));

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Resultados: Asociación de Palabras</CardTitle>
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
              label: "Emparejamientos",
              value: `${totalCorrectMatches}`,
            },
            {
              label: "Errores Totales",
              value: `${totalIncorrectAttempts}`,
            },
          ]}
        />

        <Tabs defaultValue="grafico">
          <TabsList>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico">
            <ResultBarChart config={wordMatchingChartConfig} data={chartData} />
          </TabsContent>
          <TabsContent value="tabla">
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>Aciertos</TableHead>
                    <TableHead>Errores</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const isPerfect = result.incorrectAttempts === 0;
                    const key = `round-${result.timeSpent}-${result.correctMatches}-${result.incorrectAttempts}`;
                    return (
                      <TableRow key={key}>
                        <TCell>{index + 1}</TCell>
                        <TCell>{result.expectedGroups.length}</TCell>
                        <TCell>{result.correctMatches}</TCell>
                        <TCell>{result.incorrectAttempts}</TCell>
                        <TCell>{(result.timeSpent / 1000).toFixed(1)}s</TCell>
                        <TCell>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${
                              isPerfect
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {isPerfect ? "Perfecto" : "Con errores"}
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

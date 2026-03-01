"use client";

import { CheckCircle, XCircle } from "lucide-react";
import {
  ResultBarChart,
  StatRow,
} from "@/components/exercises/charts/result-chart-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

        <Tabs defaultValue="detalle">
          <TabsList>
            <TabsTrigger value="detalle">Detalle</TabsTrigger>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
          </TabsList>

          <TabsContent value="detalle">
            <Accordion className="space-y-2" type="multiple">
              {results.map((result, roundIndex) => {
                const isPerfect = result.incorrectAttempts === 0;
                return (
                  <AccordionItem
                    key={`detail-${result.timeSpent}-${roundIndex}`}
                    value={`round-${roundIndex}`}
                  >
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          Ronda {roundIndex + 1}
                        </span>
                        <Badge variant={isPerfect ? "default" : "destructive"}>
                          {isPerfect ? "Perfecto" : "Con errores"}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {(result.timeSpent / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 px-4">
                      {/* Expected groups */}
                      <div>
                        <h4 className="mb-2 font-semibold text-sm">
                          Grupos esperados
                        </h4>
                        <div className="space-y-1">
                          {result.expectedGroups.map((group) => (
                            <div
                              className="flex flex-wrap gap-1.5"
                              key={group.object}
                            >
                              {Object.values(group)
                                .filter((v) => v)
                                .map((word) => (
                                  <span
                                    className="rounded-md bg-muted px-2 py-0.5 text-sm"
                                    key={word}
                                  >
                                    {word}
                                  </span>
                                ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Match attempts */}
                      {result.matchAttempts &&
                        result.matchAttempts.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold text-sm">
                              Intentos realizados
                            </h4>
                            <div className="space-y-1.5">
                              {result.matchAttempts.map((attempt, aIdx) => (
                                <div
                                  className="flex items-center gap-2"
                                  key={`attempt-${attempt.words.join("-")}-${aIdx}`}
                                >
                                  {attempt.isCorrect ? (
                                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                  )}
                                  <div className="flex flex-wrap gap-1.5">
                                    {attempt.words.map((word) => (
                                      <span
                                        className={`rounded-md px-2 py-0.5 text-sm ${
                                          attempt.isCorrect
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                        key={word}
                                      >
                                        {word}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Phrases if present */}
                      {result.phrases && result.phrases.length > 0 && (
                        <div>
                          <h4 className="mb-2 font-semibold text-sm">
                            Frases escritas
                          </h4>
                          <div className="space-y-1.5">
                            {result.phrases.map((phrase) => (
                              <div
                                className="rounded-md border p-2 text-sm"
                                key={phrase.expected}
                              >
                                <p className="text-muted-foreground">
                                  Esperado: {phrase.expected}
                                </p>
                                <p>Escrito: {phrase.entered}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="grafico">
            <ResultBarChart config={wordMatchingChartConfig} data={chartData} />
          </TabsContent>

          <TabsContent value="tabla">
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
                    return (
                      <TableRow
                        key={`table-${result.timeSpent}-${result.correctMatches}-${index}`}
                      >
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

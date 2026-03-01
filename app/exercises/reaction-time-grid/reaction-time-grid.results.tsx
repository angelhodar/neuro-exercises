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
import type {
  ReactionTimeGridConfig,
  ReactionTimeQuestionResult,
} from "./reaction-time-grid.schema";

const reactionTimeChartConfig = {
  tiempo: { label: "Tiempo medio (s)" },
  correcto: { label: "Correcto", color: "var(--chart-2)" },
  parcial: { label: "Parcial", color: "var(--chart-3)" },
  incorrecto: { label: "Incorrecto", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface ExerciseResultsProps {
  results: ReactionTimeQuestionResult[];
  config: ReactionTimeGridConfig;
}

function ReactionTimeHeatmap({
  cellAverages,
  gridSize,
}: {
  cellAverages: Record<number, number>;
  gridSize: number;
}) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const avg = cellAverages[i];
    if (!Number.isNaN(avg)) {
      if (avg < min) {
        min = avg;
      }
      if (avg > max) {
        max = avg;
      }
    }
  }

  function getHeatColor(value: number) {
    if (Number.isNaN(value)) {
      return "#e0f2fe";
    }
    const percent = max > min ? (value - min) / (max - min) : 0;
    const r = Math.round(110 + (56 - 110) * percent);
    const g = Math.round(231 + (189 - 231) * percent);
    const b = Math.round(183 + (248 - 183) * percent);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div
      className="grid overflow-hidden rounded border"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: 1,
      }}
    >
      {Array.from({ length: gridSize * gridSize }, (_, n) => n).map(
        (cellIndex) => (
          <div
            className="flex aspect-square items-center justify-center border border-white font-bold"
            key={`heatmap-cell-${cellIndex}`}
            style={{
              background: getHeatColor(cellAverages[cellIndex]),
              color: Number.isNaN(cellAverages[cellIndex])
                ? "#7dd3fc"
                : "#134e4a",
              fontSize: "1.25rem",
            }}
            title={
              Number.isNaN(cellAverages[cellIndex])
                ? "Sin datos"
                : `${cellAverages[cellIndex].toFixed(0)} ms`
            }
          >
            {Number.isNaN(cellAverages[cellIndex])
              ? "-"
              : `${cellAverages[cellIndex].toFixed(0)} ms`}
          </div>
        )
      )}
    </div>
  );
}

export function Results({ results, config }: ExerciseResultsProps) {
  function calculateCorrectSelections(
    result: ReactionTimeQuestionResult
  ): number {
    return result.selectedCells.filter((cell) =>
      result.targetCells.includes(cell)
    ).length;
  }

  function indexToCoordinates(index: number): string {
    const row = Math.floor(index / config.gridSize);
    const col = index % config.gridSize;
    return `[${row}, ${col}]`;
  }

  const correctSelections = results.reduce(
    (total, result) => total + calculateCorrectSelections(result),
    0
  );
  const totalTargets = results.reduce(
    (total, result) => total + result.targetCells.length,
    0
  );
  const accuracy =
    totalTargets > 0 ? (correctSelections / totalTargets) * 100 : 0;

  let totalCorrectReactionTime = 0;
  let totalCorrectSelections = 0;

  for (const result of results) {
    for (const [index, cell] of result.selectedCells.entries()) {
      if (result.targetCells.includes(cell)) {
        totalCorrectReactionTime += result.reactionTimes[index];
        totalCorrectSelections++;
      }
    }
  }

  const avgReactionTime =
    totalCorrectSelections > 0
      ? totalCorrectReactionTime / totalCorrectSelections
      : 0;

  const cellReactionTimes: Record<number, number[]> = {};
  for (const result of results) {
    for (const [i, cell] of result.selectedCells.entries()) {
      if (!cellReactionTimes[cell]) {
        cellReactionTimes[cell] = [];
      }
      cellReactionTimes[cell].push(result.reactionTimes[i]);
    }
  }
  const cellAverages: Record<number, number> = {};
  for (let i = 0; i < config.gridSize * config.gridSize; i++) {
    const arr = cellReactionTimes[i] || [];
    cellAverages[i] = arr.length
      ? arr.reduce((a, b) => a + b, 0) / arr.length
      : Number.NaN;
  }

  const chartData = results.map((result, i) => {
    const avgTime =
      result.reactionTimes.length > 0
        ? result.reactionTimes.reduce((a, b) => a + b, 0) /
          result.reactionTimes.length
        : 0;
    const correctCount = calculateCorrectSelections(result);
    let fill = "var(--color-incorrecto)";
    if (correctCount === result.targetCells.length) {
      fill = "var(--color-correcto)";
    } else if (correctCount > 0) {
      fill = "var(--color-parcial)";
    }
    return {
      question: `${i + 1}`,
      tiempo: Math.round(avgTime),
      fill,
    };
  });

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Resultados: Tiempo de Reacción</CardTitle>
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
              value: `${avgReactionTime.toFixed(0)} ms`,
            },
            {
              label: "Puntuación",
              value: `${correctSelections}/${totalTargets}`,
            },
          ]}
        />

        <Tabs defaultValue="grafico">
          <TabsList>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico">
            <ResultBarChart config={reactionTimeChartConfig} data={chartData} />
          </TabsContent>
          <TabsContent value="tabla">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Celdas Objetivo</TableHead>
                    <TableHead>Celdas Seleccionadas</TableHead>
                    <TableHead>Tiempos de Reacción</TableHead>
                    <TableHead>Correcto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const correctCount = calculateCorrectSelections(result);
                    return (
                      <TableRow
                        key={`result-${result.targetCells.join("-")}-${index}`}
                      >
                        <TCell>{index + 1}</TCell>
                        <TCell>
                          {result.targetCells.map((cell) => (
                            <span className="block" key={`target-${cell}`}>
                              {indexToCoordinates(cell)}
                            </span>
                          ))}
                        </TCell>
                        <TCell>
                          {result.selectedCells.map((cell, cellPos) => (
                            <span
                              className={`block ${result.targetCells.includes(cell) ? "text-green-600" : "text-red-600"}`}
                              key={`selected-${cell}-${result.reactionTimes[cellPos]}`}
                            >
                              {indexToCoordinates(cell)}
                            </span>
                          ))}
                        </TCell>
                        <TCell>
                          {result.reactionTimes.map((time, timePos) => (
                            <span
                              className="block"
                              key={`time-${time}-${result.selectedCells[timePos]}`}
                            >
                              {time} ms
                            </span>
                          ))}
                        </TCell>
                        <TCell>
                          {(() => {
                            let badgeClass: string;
                            if (correctCount === result.targetCells.length) {
                              badgeClass =
                                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                            } else if (correctCount > 0) {
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
                                {correctCount}/{result.targetCells.length}
                              </span>
                            );
                          })()}
                        </TCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="heatmap">
            <ReactionTimeHeatmap
              cellAverages={cellAverages}
              gridSize={config.gridSize}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

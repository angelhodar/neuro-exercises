import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ReactionTimeGridConfig,
  ReactionTimeQuestionResult,
} from "./reaction-time-grid.schema";

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
  let min = Number.POSITIVE_INFINITY,
    max = Number.NEGATIVE_INFINITY;

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
    <div>
      <h3 className="mb-2 font-semibold">Heatmap de tiempo de reacción</h3>
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
    </div>
  );
}

export function Results({ results, config }: ExerciseResultsProps) {
  // Helper function to check if a result is correct
  function calculateCorrectSelections(
    result: ReactionTimeQuestionResult
  ): number {
    return result.selectedCells.filter((cell) =>
      result.targetCells.includes(cell)
    ).length;
  }

  // Helper function to convert index to [row, col] format for display
  function indexToCoordinates(index: number): string {
    const row = Math.floor(index / config.gridSize);
    const col = index % config.gridSize;
    return `[${row}, ${col}]`;
  }

  // Calculate statistics
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

  // Calculate average reaction time for correct selections
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

  // Calcular heatmap: promedio de tiempo de reacción por celda
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

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-4 font-bold text-2xl">Resultados del Ejercicio</h2>

      <Tabs className="mb-6" defaultValue="tabla">
        <TabsList className="mb-4">
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="tabla">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
              <p className="text-gray-500 text-sm dark:text-gray-400">
                Precisión
              </p>
              <p className="font-bold text-2xl">{accuracy.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
              <p className="text-gray-500 text-sm dark:text-gray-400">
                Tiempo de Reacción Promedio
              </p>
              <p className="font-bold text-2xl">
                {avgReactionTime.toFixed(0)} ms
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
              <p className="text-gray-500 text-sm dark:text-gray-400">
                Puntuación
              </p>
              <p className="font-bold text-2xl">
                {correctSelections}/{totalTargets}
              </p>
            </div>
          </div>
          <div className="mb-6 overflow-hidden rounded-md border">
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
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {result.targetCells.map((cell) => (
                          <span className="block" key={`target-${cell}`}>
                            {indexToCoordinates(cell)}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {result.selectedCells.map((cell, cellPos) => (
                          <span
                            className={`block ${result.targetCells.includes(cell) ? "text-green-600" : "text-red-600"}`}
                            key={`selected-${cell}-${result.reactionTimes[cellPos]}`}
                          >
                            {indexToCoordinates(cell)}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {result.reactionTimes.map((time, timePos) => (
                          <span
                            className="block"
                            key={`time-${time}-${result.selectedCells[timePos]}`}
                          >
                            {time} ms
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="heatmap">
          <ReactionTimeHeatmap
            cellAverages={cellAverages}
            gridSize={config.gridSize}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

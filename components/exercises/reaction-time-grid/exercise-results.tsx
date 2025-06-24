import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ReactionTimeQuestionResult } from "./reaction-time-grid-schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ExerciseResultsProps {
  results: ReactionTimeQuestionResult[];
  gridSize: number;
}

function ReactionTimeHeatmap({ cellAverages, gridSize }: { cellAverages: Record<number, number>, gridSize: number }) {
  let min = Infinity, max = -Infinity;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const avg = cellAverages[i];
    if (!isNaN(avg)) {
      if (avg < min) min = avg;
      if (avg > max) max = avg;
    }
  }

  function getHeatColor(value: number) {
    if (isNaN(value)) return "#e0f2fe";
    const percent = max > min ? (value - min) / (max - min) : 0;
    const r = Math.round(110 + (56 - 110) * percent);
    const g = Math.round(231 + (189 - 231) * percent);
    const b = Math.round(183 + (248 - 183) * percent);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Heatmap de tiempo de reacción</h3>
      <div
        className="grid border rounded overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: 1,
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center aspect-square font-bold border border-white"
            style={{ background: getHeatColor(cellAverages[i]), color: !isNaN(cellAverages[i]) ? '#134e4a' : '#7dd3fc', fontSize: '1.25rem' }}
            title={!isNaN(cellAverages[i]) ? `${cellAverages[i].toFixed(0)} ms` : 'Sin datos'}
          >
            {!isNaN(cellAverages[i]) ? `${cellAverages[i].toFixed(0)} ms` : "-"}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExerciseResults({ results, gridSize }: ExerciseResultsProps) {
  // Helper function to check if a result is correct
  function calculateCorrectSelections(result: ReactionTimeQuestionResult): number {
    return result.selectedCells.filter((cell) => result.targetCells.includes(cell)).length
  }

  // Helper function to convert index to [row, col] format for display
  function indexToCoordinates(index: number): string {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    return `[${row}, ${col}]`
  }

  // Calculate statistics
  const correctSelections = results.reduce((total, result) => total + calculateCorrectSelections(result), 0)
  const totalTargets = results.reduce((total, result) => total + result.targetCells.length, 0)
  const accuracy = totalTargets > 0 ? (correctSelections / totalTargets) * 100 : 0

  // Calculate average reaction time for correct selections
  let totalCorrectReactionTime = 0
  let totalCorrectSelections = 0

  results.forEach((result) => {
    result.selectedCells.forEach((cell, index) => {
      if (result.targetCells.includes(cell)) {
        totalCorrectReactionTime += result.reactionTimes[index]
        totalCorrectSelections++
      }
    })
  })

  const avgReactionTime = totalCorrectSelections > 0 ? totalCorrectReactionTime / totalCorrectSelections : 0

  // Calcular heatmap: promedio de tiempo de reacción por celda
  const cellReactionTimes: Record<number, number[]> = {};
  results.forEach((result) => {
    result.selectedCells.forEach((cell, i) => {
      if (!cellReactionTimes[cell]) cellReactionTimes[cell] = [];
      cellReactionTimes[cell].push(result.reactionTimes[i]);
    });
  });
  const cellAverages: Record<number, number> = {};
  for (let i = 0; i < gridSize * gridSize; i++) {
    const arr = cellReactionTimes[i] || [];
    cellAverages[i] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN;
  }

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Resultados del Ejercicio</h2>

      <Tabs defaultValue="tabla" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="tabla">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Precisión</p>
              <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo de Reacción Promedio</p>
              <p className="text-2xl font-bold">{avgReactionTime.toFixed(0)} ms</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación</p>
              <p className="text-2xl font-bold">
                {correctSelections}/{totalTargets}
              </p>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden mb-6">
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
                  const correctCount = calculateCorrectSelections(result)
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {result.targetCells.map((cell, i) => (
                          <span key={i} className="block">
                            {indexToCoordinates(cell)}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {result.selectedCells.map((cell, i) => (
                          <span
                            key={i}
                            className={`block ${result.targetCells.includes(cell) ? "text-green-600" : "text-red-600"}`}
                          >
                            {indexToCoordinates(cell)}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {result.reactionTimes.map((time, i) => (
                          <span key={i} className="block">
                            {time} ms
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            correctCount === result.targetCells.length
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : correctCount > 0
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {correctCount}/{result.targetCells.length}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="heatmap">
          <ReactionTimeHeatmap cellAverages={cellAverages} gridSize={gridSize} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

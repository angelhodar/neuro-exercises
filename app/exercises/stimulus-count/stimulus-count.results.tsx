"use client";

import {
  correctIncorrectChartConfig,
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell as TCell,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StimulusCountQuestionResult } from "./stimulus-count.schema";

interface StimulusCountResultsProps {
  results: StimulusCountQuestionResult[];
}

export function Results({ results }: StimulusCountResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy =
    results.length > 0 ? (totalCorrect / results.length) * 100 : 0;

  const chartData = results.map((r, i) => ({
    question: `${i + 1}`,
    tiempo: r.timeSpent,
    fill: r.isCorrect ? "var(--color-correcto)" : "var(--color-incorrecto)",
  }));

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Resultados: Conteo de Estímulos</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatRow
          items={[
            { label: "Precisión", value: `${accuracy.toFixed(1)}%` },
            {
              label: "Correctas",
              value: `${totalCorrect}/${results.length}`,
            },
            { label: "Preguntas", value: `${results.length}` },
          ]}
        />

        <Tabs defaultValue="grafico">
          <TabsList>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabla">Tabla</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico">
            <ResultBarChart
              config={correctIncorrectChartConfig}
              data={chartData}
            />
          </TabsContent>
          <TabsContent value="tabla">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Estímulos Mostrados</TableHead>
                  <TableHead>Respuesta del Usuario</TableHead>
                  <TableHead>Correcto</TableHead>
                  <TableHead>Tiempo (s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow
                    key={`${result.shownStimuli}-${result.userAnswer}-${index}`}
                  >
                    <TCell>{index + 1}</TCell>
                    <TCell>{result.shownStimuli}</TCell>
                    <TCell>{result.userAnswer}</TCell>
                    <TCell>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          result.isCorrect
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {result.isCorrect ? "Sí" : "No"}
                      </span>
                    </TCell>
                    <TCell>{(result.timeSpent / 1000).toFixed(1)}s</TCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

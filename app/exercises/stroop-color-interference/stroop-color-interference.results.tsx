"use client";

import { CheckCircle, XCircle } from "lucide-react";
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
import type { StroopColorInterferenceQuestionResult } from "./stroop-color-interference.schema";

interface StroopColorInterferenceResultsProps {
  results: StroopColorInterferenceQuestionResult[];
}

export function Results({ results }: StroopColorInterferenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy = (totalCorrect / results.length) * 100;
  const averageResponseTime =
    results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;

  const chartData = results.map((r, i) => ({
    question: `${i + 1}`,
    tiempo: r.responseTime,
    fill: r.isCorrect ? "var(--color-correcto)" : "var(--color-incorrecto)",
  }));

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Resultados: Stroop</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatRow
          items={[
            { label: "Precisión", value: `${accuracy.toFixed(1)}%` },
            {
              label: "Puntuación",
              value: `${totalCorrect}/${results.length}`,
            },
            {
              label: "Tiempo Medio",
              value: `${(averageResponseTime / 1000).toFixed(2)}s`,
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
              config={correctIncorrectChartConfig}
              data={chartData}
            />
          </TabsContent>
          <TabsContent value="tabla">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Palabra</TableHead>
                    <TableHead>Color Tinta</TableHead>
                    <TableHead>Tu Respuesta</TableHead>
                    <TableHead className="text-right">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={`${result.word}-${result.color}-${index}`}>
                      <TCell>{index + 1}</TCell>
                      <TCell>{result.word}</TCell>
                      <TCell>{result.color}</TCell>
                      <TCell
                        className={
                          result.isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {result.userAnswer}
                      </TCell>
                      <TCell className="text-right">
                        {result.isCorrect ? (
                          <CheckCircle className="inline-block h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="inline-block h-5 w-5 text-red-600" />
                        )}
                      </TCell>
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

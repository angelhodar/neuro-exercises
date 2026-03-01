"use client";

import { AccuracyDonutChart } from "@/components/exercises/charts/result-chart-card";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColorSequenceQuestionResult } from "./color-sequence.schema";

const SEQUENCE_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
];

interface ColorSequenceResultsProps {
  results: ColorSequenceQuestionResult[];
}

export function Results({ results }: ColorSequenceResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const totalIncorrect = results.length - totalCorrect;
  const accuracy = (totalCorrect / results.length) * 100;

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Resultados: Secuencia de Colores</CardTitle>
        <CardDescription>
          Aquí tienes un resumen de tu rendimiento en el ejercicio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr]">
          <AccuracyDonutChart
            accuracy={accuracy}
            correct={totalCorrect}
            incorrect={totalIncorrect}
          />

          <div className="grid gap-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Precisión</p>
              <p className="font-semibold text-2xl tracking-tight">
                {accuracy.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Puntuación</p>
              <p className="font-semibold text-2xl tracking-tight">
                {totalCorrect}/{results.length}
              </p>
            </div>
          </div>
        </div>

        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Secuencia Objetivo</TableHead>
                <TableHead>Secuencia Usuario</TableHead>
                <TableHead>Correcto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={`row-${result.targetSequence.join("-")}-${index}`}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {result.targetSequence.map((c: number, i: number) => (
                        <span
                          className={`inline-block h-6 w-6 rounded-sm ${SEQUENCE_COLORS[c]}`}
                          key={`target-${i}-${c}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {result.userSequence.map((c: number, i: number) => (
                        <span
                          className={`inline-block h-6 w-6 rounded-sm ${SEQUENCE_COLORS[c]} ${
                            c !== result.targetSequence[i]
                              ? "ring-2 ring-red-500 ring-offset-1"
                              : ""
                          }`}
                          key={`user-${i}-${c}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.isCorrect ? (
                      <span className="font-semibold text-green-600">Sí</span>
                    ) : (
                      <span className="font-semibold text-red-600">No</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

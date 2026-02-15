import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StimulusCountQuestionResult } from "./stimulus-count.schema";

interface StimulusCountResultsProps {
  results: StimulusCountQuestionResult[];
}

export function Results({ results }: StimulusCountResultsProps) {
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const accuracy =
    results.length > 0 ? (totalCorrect / results.length) * 100 : 0;

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-4 font-bold text-2xl">Resultados del Ejercicio</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Precisión</p>
          <p className="font-bold text-2xl">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Respuestas Correctas
          </p>
          <p className="font-bold text-2xl">
            {totalCorrect}/{results.length}
          </p>
        </div>
        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p className="text-gray-500 text-sm dark:text-gray-400">Preguntas</p>
          <p className="font-bold text-2xl">{results.length}</p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Estímulos Mostrados</TableHead>
              <TableHead>Respuesta del Usuario</TableHead>
              <TableHead>Correcto</TableHead>
              <TableHead>Tiempo (ms)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow
                key={`${result.shownStimuli}-${result.userAnswer}-${index}`}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{result.shownStimuli}</TableCell>
                <TableCell>{result.userAnswer}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                      result.isCorrect
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {result.isCorrect ? "Sí" : "No"}
                  </span>
                </TableCell>
                <TableCell>{result.timeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

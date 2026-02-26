"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updatePatientTest } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PatientTest } from "@/lib/db/schema";
import { EVALUATED_PROCESS_LABELS, EVALUATED_PROCESSES } from "../constants";

const editTestSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  evaluatedProcess: z.string().min(1, "El proceso evaluado es obligatorio"),
  testName: z.string().optional(),
  score: z.string().optional(),
  observations: z.string().optional(),
});

type EditTestFormValues = z.infer<typeof editTestSchema>;

interface EditTestButtonProps {
  test: PatientTest;
  patientId: number;
}

export default function EditTestButton({
  test,
  patientId,
}: EditTestButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditTestFormValues>({
    resolver: zodResolver(editTestSchema),
    defaultValues: {
      date: new Date(test.date).toISOString().split("T")[0],
      evaluatedProcess: test.evaluatedProcess,
      testName: test.testName || "",
      score: test.score || "",
      observations: test.observations || "",
    },
  });

  const onSubmit = async (data: EditTestFormValues) => {
    setIsLoading(true);
    try {
      await updatePatientTest(test.id, patientId, {
        date: new Date(data.date),
        evaluatedProcess: data.evaluatedProcess,
        testName: data.testName || null,
        score: data.score || null,
        observations: data.observations || null,
      });
      toast.success("Test actualizado exitosamente");
      setOpen(false);
    } catch (error) {
      console.error("Error updating test:", error);
      toast.error("Error al actualizar el test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar test</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evaluatedProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proceso evaluado *</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar proceso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVALUATED_PROCESSES.map((process) => (
                          <SelectItem
                            key={process}
                            label={EVALUATED_PROCESS_LABELS[process]}
                            value={process}
                          >
                            {EVALUATED_PROCESS_LABELS[process]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="testName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del test</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntuación</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Observaciones del test..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
